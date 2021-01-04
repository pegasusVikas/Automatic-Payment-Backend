var express = require('express');
var router = express.Router();
const web3 = require("../web3");
const axios = require('axios').default;
const Tx = require("ethereumjs-tx").Transaction;
const User = require("../models/User");
const Service = require("../models/Service");
//const {WeiToRs,convert} =require("../converter")

router.post('/', async(req, res) => {

  const { senderId, receiverId, amount } = req.body; //amount in INR
  
  try {
    const sender = await User.find({ id: senderId });
    const receiver = await Service.find({ id: receiverId });
    console.log("sender: ", sender);
    console.log("receiver: ", receiver);
  } catch(err) {
    console.log(err.message);
  }

  var wallet1 = {
    address: sender.wallet,
    privateKey: sender.key
  };

  var wallet2 = {
    address: receiver.wallet,
    privateKey: receiver.key
  };

  var amount = req.body.amount; //Rupee
  axios.get(`https://min-api.cryptocompare.com/data/price?fsym=INR&tsyms=ETH`)
    .then((resp) => {
      amount = amount * resp.data["ETH"];
      if (wallet1.privateKey.slice(0, 2) === "0x") {
        wallet1.privateKey = wallet1.privateKey.slice(2); 
      }
      const privKey = new Buffer.from(wallet1.privateKey, "hex");

      web3.eth.getTransactionCount(wallet1.address, (err, txCount) => {
        if(err) {
          res.status = 501;
          res.json(err);
        }
        else { 
          const txObject = {
            nonce: web3.utils.toHex(txCount),
            to: wallet2.address,
            value: web3.utils.toHex(web3.utils.toWei(`${amount}`, 'ether')),//amount
            gasLimit: web3.utils.toHex(21000),//gasLimit(Wei)
            gasPrice: web3.utils.toHex(web3.utils.toWei('1', 'gwei')),//gasPrice
            chainId: web3.utils.toHex(42)
          }
          //transaction cost =gasLimit*gasPrice
    
          //sign the transaction
          const tx = new Tx(txObject, { chain: 'kovan' });
          tx.sign(privKey);

          const serializedTransaction = tx.serialize();
          const raw = "0x" + serializedTransaction.toString('hex');
    
          //send transaction
          web3.eth.sendSignedTransaction(raw, (err, txHash) => {
            if (err) {
              res.status=501;
              res.json({err:err.message});
            } else {
              console.log('txHash', txHash);
              //fetching transaction details from hash
              web3.eth.getTransaction(`${txHash}`)
                .then((receipt) => {
                  //console.log(receipt);
                  var json={ INR:{},ETH:{}}
                  axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=INR`)
                    .then((ETI) => {
                      const WeiToRs = (val) => {
                        return parseFloat(web3.utils.fromWei(`${val}`, "ether")) * ETI;
                      }
                      //converting Wei to Rupee
                      ETI = ETI.data["INR"];
                      json.INR.amount = WeiToRs(receipt.value);
                      json.INR.tax = WeiToRs(receipt.gas*receipt.gasPrice)
                      json.ETH = receipt;
                      res.json(json);

                    }).catch((err) => res.json(err));
                }).catch((err) => res.json(err));
            }
          });
        }
      });
    });
});

module.exports = router;