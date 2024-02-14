const ethers = require("ethers")

const sig = "transferFrom(address,address,uint256)"
console.log("Sig:", sig)
console.log("Hash:", ethers.id(sig).substring(0, 10))