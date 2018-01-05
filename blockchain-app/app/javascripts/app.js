// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Material design css
import "../stylesheets/materialDesign/material.min.css";
import "../stylesheets/materialDesign/material.min.js";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
//import uecontract_artifacts from '../../build/contracts/ue_contract.json'
import uemanager_artifacts from '../../build/contracts/ue_manager.json'

// UEContract is our usable abstraction, which we'll use through the code below.
var UEManager = contract(uemanager_artifacts);


// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account; // Current account
var enrolledUEs = [];//all the ue where the student is enroled

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    UEManager.setProvider(web3.currentProvider);

    console.log(web3);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      web3.eth.defaultAccount = account;
	    document.getElementById("currentAccount").innerHTML = account;

      //self.refreshUE();

		  // display accounts list
		  var accountList = document.getElementById('accountList');
		  for(var i = 0; i < accounts.length; i++) {
			  var opt = document.createElement('option');
			  opt.innerHTML = accounts[i];
			  opt.value = accounts[i];
			  accountList.appendChild(opt);
		  }

    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  //refreshing the UEs

  refreshUE: function() {
    var self = this;
    var ue;
    UEContract.deployed.then(function(instance) {
      ue = instance;
      return meta.get_ue_name();
    });
  },

  //creating an UE

  //ask permission to be a teacher

  askToBeProfessor : function(hash){
    UEManager.deployed().then(function(instance) {
      var ue_manager = instance;
      console.log(ue_manager);
      console.log(web3);
      console.log(web3.eth.defaultAccount);
      ue_manager.askProfessorValidation(hash, function(res,err){
        if(err === null){
          console.log("result = "+res);
          document.getElementById("infoMessage").innerHTML = "Hash stored on blockchain. Send an email to aaa@bbb.ccc to validate your hash";
        }
      });
    })
  },

  isProfessorValid: function(hash){
    UEManager.deployed().then(function(instance){
      instance.isProfessorValid(hash, function(res, err){
        if(err === null){
          console.log("res = "+res);
          return true;
        }else{
          console("there was an error in isProfessorValid()");
          return false;
        }
      })
    })
  },

  loginTeacher: function(){
    var hash = document.getElementById("professorHash").value;
    console.log(hash);
    if(this.isProfessorValid(hash)){
      //route to teacher page
    }else{
      this.askToBeProfessor(hash);
    }
  },

  /*
  createUE: function() {
    var self = this;
    var ue;
    UEContract.deployed().then(function(instance) {
      //check l'autorisation à un moment ?
      ue = instance;
      console.log(ue);
      var nomResponsable = document.getElementById("nomResponsable").value;
      var nomUE = document.getElementById("nomUE").value;
      var maxPlaces = parseInt(document.getElementById("maxPlaces").value);
	  if(nomResponsable && 	nomUE && maxPlaces){
	  var contractInstance = UEContract.new(nomResponsable, nomUE, maxPlaces,{from: web3.eth.accounts[0], gas: 3000000}).then(function(value) {
		// fulfillment
		//refreching UEL list
		refreshUEList(value);
		self.setStatus("Création d'UE effectuée")
		}, function(reason) {
		// rejection
		console.log(reason);
		});
		}else{
		self.setStatus("Champs vides!");
	}
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Erreur à la création, voir les logs");
	  console.log(e);
    });
  },*/

  getEnrolledUEs : function (){
    var ue_manager;
    UEManager.deployed().then(function(instance){
      ue_manager = instance;
      var enrolledUEAddresses = [];
      ue_manager.get_enrolled_ue(function(res,err){
        if (err === null){
          enrolledUEAddresses = res;
          enrolledUEAddresses.forEach(element => {
            ue_manager.get_student_info(element,function(res){
              enrolledUEs.push(res);
              console.log(res);
              //console.log(enrolledUEs);
            })
          });
        }
      })
    }).then(function(){
      console.log(enrolledUEs);
    })
  },

  changeAccount: function ()
	{
		// console.log(document.getElementById("accountList").selectedIndex);
		account = accounts[document.getElementById("accountList").selectedIndex];
		document.getElementById("currentAccount").innerHTML = account;
		// console.log("Current account : " + account);
	}

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof window.web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    //console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
    console.error("Please use a web3 browser");
  }

  App.start();
});

function refreshUEList(contractInstance)
{
  contractInstance.get_ue_name.call({from: account})
	.then(function(receipt){
	var node = document.createElement("LI");
	var textnode = document.createTextNode(receipt);
	node.appendChild(textnode);
	document.getElementById("UEList").appendChild(node);
	});
}