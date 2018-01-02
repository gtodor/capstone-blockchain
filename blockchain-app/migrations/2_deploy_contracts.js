var UEManager = artifacts.require("ue_manager");
var SmartId = artifacts.require("SmartIdentity");

module.exports = function(deployer) {
  deployer.deploy(SmartId);
  deployer.deploy(UEManager);
};