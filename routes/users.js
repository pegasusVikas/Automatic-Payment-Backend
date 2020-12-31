var express = require('express');
var router = express.Router();
const web3=require("../web3");
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
