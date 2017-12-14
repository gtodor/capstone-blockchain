var UEContract = artifacts.require("./ue_contract.sol");

module.exports = function(deployer) {
  deployer.deploy(UEContract);
};
