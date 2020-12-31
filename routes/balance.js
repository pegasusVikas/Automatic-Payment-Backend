var express = require('express');
var router = express.Router();
const web3 = require("../web3");
const axios = require("axios").default
//const {WeiToRs} =require("../converter")

router.post('/', (req, res) => {
    web3.eth.getBalance(req.body.id, (err, bal) => {
        if (err) {
            res.status = 501;
            res.json({ err: err })
        }
        else {
            axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=INR`)
                .then((resp) => {
                    res.status = 200;
                    bal=parseFloat(web3.utils.fromWei(`${bal}`, "ether"))*resp.data["INR"];
                    res.json({ balance:bal  });
                })
                .catch((err) => {
                    return err;
                })
        }
    });
})

module.exports = router;