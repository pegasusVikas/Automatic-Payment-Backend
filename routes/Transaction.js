var express = require('express');
var router = express.Router();
const web3 = require("../web3");
const axios = require('axios').default;
const Tx = require("ethereumjs-tx").Transaction;
const User = require("../models/User");
const Service = require("../models/Service");
//const {WeiToRs,convert} =require("../converter")

/**
 * params: senderId, receiverId, amount(in INR)
 */
router.post('/', async (req, res) => {
  var { senderId, receiverId, amount } = req.body; // Amount in INR
  User.findOne({ id: senderId }, (err, sender) => {
    if (err) {
      console.log(err.message);
      return;
    }
    Service.findOne({ id: receiverId }, (error, receiver) => {
      if (error) {
        console.log(error.message);
        return;
      }
      var wallet1 = {
        address: sender.wallet, //'0x9027a33b4917e17D032F509eAbDBe7193E2Bb0eB',
        privateKey: sender.key //'0x5d2e44bf4769b98371f2befaebec6a478d1f87063e9413b8675552b00f6ae65a'
      };
      var wallet2 = {
        address: receiver.wallet, //'0x167cc08C0722710126c5c563Ca8E03ebef5D7D3a',
        privateKey: receiver.key //'0x2ed6138cddc59b2a48529d659898b9a2fe22e045a78989f388faf5530d8bb853'
      };

      const accountSid = 'AC1f425e6850b956ce8adca11c18715306';
      const authToken = '6afac31880661a0b0143d0f362e41630';
      const client = require('twilio')(accountSid, authToken);

      axios.get(`https://min-api.cryptocompare.com/data/price?fsym=INR&tsyms=ETH`)
        .then((resp) => {
          amount = (amount * resp.data["ETH"]).toFixed(18); //float point precsion

          if (wallet1.privateKey.slice(0, 2) === "0x") {
            wallet1.privateKey = wallet1.privateKey.slice(2);
          }

          const privKey = new Buffer.from(wallet1.privateKey, "hex");
          web3.eth.getTransactionCount(wallet1.address, (err, txCount) => {
            if (err) {
              res.status = 501;
              res.json({ err });
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
              //transaction cost = gasLimit * gasPrice;

              //sign the transaction
              const tx = new Tx(txObject, { chain: 'kovan' });
              tx.sign(privKey)

              const serializedTransaction = tx.serialize();
              const raw = "0x" + serializedTransaction.toString('hex');

              //send transaction
              web3.eth.sendSignedTransaction(raw)
                .on('receipt', (receipt) => {
                  console.log(receipt);
                  if (!receipt) {
                    console.log("no receipt")
                    res.json({ err: "no receipt returned" })
                    res.status = 501;
                  }
                  var json = { INR: {}, ETH: {}, reached: true };
                  console.log("this is receipt", receipt);
                  axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=INR`)
                    .then((ETI) => {

                      // converting Wei to INR
                      const WeiToRs = (val) => {
                        return parseFloat(web3.utils.fromWei(`${val}`, "ether")) * ETI;
                      }
                      ETI = ETI.data["INR"];
                      value = parseInt(txObject.value, 16);
                      gasLimit = parseInt(txObject.gasLimit, 16);
                      gasPrice = parseInt(txObject.gasPrice, 16);

                      client.messages
                        .create({
                          body: `${receiver.message}.\n\nyour transaction is done, amount:${value} Wei\n\n\n you can check your transaction here https://kovan.etherscan.io/tx/${receipt.transactionHash}`,
                          from: '+13344893719',
                          to: `+91${sender.mobile}`
                        })
                        .then(message => console.log(message.sid))
                        .done();

                      json.INR.amount = WeiToRs(value);
                      json.INR.tax = WeiToRs(gasLimit * gasPrice)
                      json.ETH = receipt;
                      json.ETH.value = value
                      json.ETH.gasLimit = gasLimit
                      json.ETH.gasPrice = gasPrice

                      res.json(json);

                    }).catch((err) => { console.log(err); res.status = 501; res.json({ err: err.message }) })

                })
                .on('transactionHash', (txHash) => {
                  console.log('txHash', txHash);
                  client.messages
                    .create({
                      body: `Your transaction has been queued.`,
                      from: '+13344893719',
                      to: `+91${sender.mobile}`
                    })
                    .then(message => console.log(message.sid))
                    .done();
                })
                .on('error', (err) => { console.error(err); res.status = 501; res.json({ err: err.message }) })
            }
          }).catch((err) => { console.error(err); res.status = 501; res.json({ err: err.message }) })
        }).catch((err) => { console.error(err); res.status = 501; res.json({ err: err.message }) })
      }).catch((err) => { console.error(err); res.status = 501; res.json({ err: err.message }) })
      }).catch((err) => { console.error(err); res.status = 501; res.json({ err: err.message }) })
    })

module.exports = router;
