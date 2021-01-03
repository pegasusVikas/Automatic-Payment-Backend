var express = require('express');
var router = express.Router();
const web3 = require("../web3");
const axios = require('axios').default;
const Tx = require("ethereumjs-tx").Transaction;
//const {WeiToRs,convert} =require("../converter")

router.post('/', async(req, res) => {
    
  var wallet1 = {
    address: '0x9027a33b4917e17D032F509eAbDBe7193E2Bb0eB',
    privateKey: '0x5d2e44bf4769b98371f2befaebec6a478d1f87063e9413b8675552b00f6ae65a'
  };

  var wallet2 = {
    address: '0x167cc08C0722710126c5c563Ca8E03ebef5D7D3a',
    privateKey: '0x2ed6138cddc59b2a48529d659898b9a2fe22e045a78989f388faf5530d8bb853'
  };

  const accountSid = 'AC1f425e6850b956ce8adca11c18715306'; 
  const authToken = 'd17995d9ad7398c9483bfc779bdb952c'; 
  const client = require('twilio')(accountSid, authToken); 

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
              //sending message to phone
                      client.messages 
                      .create({ 
                        body: 'Hey there !!! this is from Automated Backend server', 
                        from: '+13344893719',       
                        to: '+918897317943' 
                      }) 
                      .then(message => console.log(message.sid)) 
                      .done();
                  
              web3.eth.getTransaction

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
                      console.log(json);

                    }).catch((err) => res.json(err));
                }).catch((err) => res.json(err));
            }
          });
        }
      });
    });
});

module.exports = router;