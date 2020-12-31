var express = require('express');
var router = express.Router();
const web3 = require("../web3");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ text: "send something" })
});

router.get('/create', (req, res) => {
  let genKeyPairs = web3.eth.accounts.create();
  res.json(genKeyPairs);
})

module.exports = router;
//https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=INR