var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");
const sgMail = require('@sendgrid/mail');
const web3 = require("../web3");
const User = require("../models/User");
const Service = require("../models/Service");

/* Generate a crypto-wallet with web3 */
const gen = () => {
  let genKeyPairs = web3.eth.accounts.create();
  return {
    wallet: genKeyPairs.address,
    key: genKeyPairs.privateKey
  }
};

const respond = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', ['POST', 'PUT', 'DELETE']);
  return res.send("hi");
}

router.options('/register-user', (req, res) => {
  respond(res);
});

router.options('/register-service', (req, res) => {
  respond(res);
});

router.options('/user-login', (req, res) => {
  respond(res);
});

router.options('/service-login', (req, res) => {
  respond(res);
})

/* GET home page. */
router.get('/', (req, res, next) => {
  res.json({ text: "send something",
    automatedPaymentVersion:"2.0.0" });
});

/* Create a user */
router.post('/register-user', async(req, res) => {
  // const { id, wallet, key, name, mobile, email, company, model, plate } = req.body;
  const { id, name, mobile, email, company, model, plate } = req.body;
  User.findOne({ plate }, async(err, doc) => {
    if(err) console.log(err.message);
    else {
      if(doc) res.send(false);
      else {
        let { wallet, key } = gen(); 
        let password = Math.random().toString(36).substring(2);
        const salt = await bcrypt.genSalt(10);
        const encrypted_password = await bcrypt.hash(password, salt);
        User.create({ id, wallet, key, name, mobile, email, company, model, plate, password: encrypted_password }, (err, doc) => {
          if(err) console.log(err.message);
          else {
            try {
              sgMail.setApiKey('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');
              const msg = {
                to: email,
                from: 'viswa.es27@gmail.com',
                subject: 'Autopay User Registration',
                text: `You have successfully registered as a user at Autopay. Here\'s your temporary password: ${password}`,
              };
              sgMail.send(msg);
            } catch (err) {
              console.log(err.message);
            }
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.json(doc);
          }
        });
      }
    }
  });
});

/* User Login */
router.post('/user-login', async (req, res) => {
  let { email, password } = req.body;
  User.findOne({ email }, async(err, user) => {
    if(err) console.log(err.message);
    else {
      if (!user) res.json({ "err": "user not found" });
      if(await bcrypt.compare(password, user.password)) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(user.hashes);
      } 
      else res.send(false);
    }
  }); 
});

/* Create a service */
router.post('/register-service', async(req, res) => {
  const { id, name, address, type, message, email } = req.body;
  let { wallet, key } = gen();
  let password = Math.random().toString(36).substring(2);
  const salt = await bcrypt.genSalt(10);
  const encrypted_password = await bcrypt.hash(password, salt);
  Service.create({ id, name, address, wallet, key, type, message, password: encrypted_password, email }, async(err, doc) => {
    if(err) console.log(err.message);
    else {
      try {
        sgMail.setApiKey('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');
        const msg = {
          to: email,
          from: 'viswa.es27@gmail.com',
          subject: 'Autopay Service Registration',
          text: `You have successfully registered as a Service at Autopay! Here\'s your temporary password: ${password}`,
        };
        sgMail.send(msg);
      } catch (err) {
        console.log(err.message);
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(doc);
    }
  });
});

/* Service Login */
router.post('/service-login', async(req, res) => {
  const { email, password } = req.body;
  Service.findOne({ email }, async(err, service) => {
    if(err) console.log(err.message);
    else {
      if (!user) res.json({ "err": "service id not found" });
      if(await bcrypt.compare(password, user.password)) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(service.hashes);
      } 
      else res.send(false);
    }
  });
});

/* Create a web3 account */
router.get('/create', (req, res) => {
  let genKeyPairs = web3.eth.accounts.create();
  res.json(genKeyPairs);
});

module.exports = router;
//https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=INR