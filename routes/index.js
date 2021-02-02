var express = require('express');
var router = express.Router();
const web3 = require("../web3");
const User = require("../models/User");
const Service = require("../models/Service");

/* GET home page. */
router.get('/', (req, res, next) => {
  res.json({ text: "send something",
        automatedPaymentVersion:"2.0.0" });
});

router.post('/user', (req, res) => {
  const { id, wallet, key, name, mobile, email, company, model, plate } = req.body;
  User.create({ id, wallet, key, name, mobile, email, company, model, plate }, (err, doc) => {
    if(err) console.log(err.message);
    else res.json(doc);
  });
});

router.post('/service', (req, res) => {
  const { id, name,address,wallet, key, type, message } = req.body;
  Service.create({ id:id, name:name,address:address, wallet:wallet, key:key, type:type, message:message }, (err, doc) => {
    if(err) console.log(err.message);
    else res.json(doc);
  });
});

router.get('/create', (req, res) => {
  let genKeyPairs = web3.eth.accounts.create();
  res.json(genKeyPairs);
})

module.exports = router;
//https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=INR