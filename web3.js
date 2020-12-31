const Web3 =require("web3");

const web3 = new Web3(
    new Web3.providers.HttpProvider(
      "https://kovan.infura.io/v3/f36c68a552ed4f8eb64023ced5995137"
    )
  );module.exports= web3;