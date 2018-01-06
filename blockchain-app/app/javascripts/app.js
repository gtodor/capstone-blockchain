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
var allUEs = [];
var enrollUESelected;
var enrolledUEAddresses = [];

window.App = {
  start: function() {
    var self = this;
    return new Promise(function(accept,reject){
        // Bootstrap the MetaCoin abstraction for Use.
        UEManager.setProvider(web3.currentProvider);
    
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
            //document.getElementById("currentAccount").innerHTML = account;
            return accept();
        });
    });
    
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
      var txhash = ue_manager.askProfessorValidation.sendTransaction(hash,{from:account,gas:4700000});
      return txhash;
    }).then(function(res){
      console.log("resultat = "+res);
      document.getElementById("infoMessage").innerHTML = "hash stored on blockchain. send an email to aaa@bbb.ccc with your hash to be accepted";
      return res;
    }).catch(function(e){
      console.log("ERROR: "+e);
    })
  },

  loginTeacher: function(){
    var hash = document.getElementById("professorHash").value;
    console.log(hash);
    var self = this;
    UEManager.deployed().then(function(instance){
      console.log(account);
      return instance.isProfessorValid.call(hash,{from:account});
    }).then(function(res){
      console.log("result = "+ res);
      if(res === true){
        //route to teacher page
        //document.getElementById('infoMessage').innerHTML = "Proffessor is accepted. Transfering to your page ...";
        window.location = 'http://localhost:8080/teacher.html';
      }else{
        self.askToBeProfessor(hash);
      }
    }).catch(function(e){
      console.log("ERROR: "+e);
    })
  },

  getSmartIdContractAddress: function(){
    UEManager.deployed().then(function(inst){
      return inst.getSmartIdContractAddress.call();
    }).then(function(res){
      console.log(res)});
  },

  getEnrolledUEs : function (){
    var self = this;
    UEManager.deployed().then(function(instance){
      return instance.get_enrolled_ue.call({from:account});
    }).then(function(res){
      console.log(res);
      enrolledUEAddresses = res;
      var promises = res.map(function(addr){
        return new Promise(function(accept,reject){
          UEManager.deployed().then(function(instance){
            typeof(addr);
            return instance.get_student_info.call(addr,{from:account});
          }).then(function(res){
            enrolledUEs.push(res);
            return accept();
          }).catch(function(e){
            console.log(e);
            return reject();
          })
        })
      })
      Promise.all(promises).then(function(){
        //fill the table with the enrolled ue
        self.fillTable();
      })
    }).catch(function(e){
      console.log(e);
    })
  },

  fillTable: function(){
    var table = document.getElementById("tableBody");
    table.innerHTML = '';
    console.log(enrolledUEs);
    for(var i=0; i<enrolledUEs.length; i++){
      var tr= document.createElement("tr");
      var th = document.createElement("th");
      th.setAttribute("scope","row");
      th.textContent = i;
      var td1 = document.createElement("td");
      var td2 = document.createElement("td");
      td1.textContent = enrolledUEs[i][2];
      if(enrolledUEs[i][1] === false){
        td2.textContent = "Not Validated";
      }else{
        td2.textContent = "Validated";
      }
      
      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      table.appendChild(tr);
    }
  },

  getAllUEs: function(){
    var self = this;
    UEManager.deployed().then(function(instance){
      return instance.get_number_of_ue.call({from:account});
    }).then(function(res){
      console.log(res.toNumber());
      var nb = res.toNumber();
      var promises = [];
      for(var i=0;i<nb;i++){
        promises.push(self.getName(i));
      }
      Promise.all(promises).then(function(){
        console.log(allUEs.length);
        if(allUEs.length !== 0){
          enrollUESelected = allUEs[0];
        }
        self.fillAllUEList();
      })
    }).catch(function(e){
      console.log(e);
    })
  },

  getName: function(i){
    return new Promise(function(accept,reject){
      var ii=new BigNumber(i);
      console.log(i);
      UEManager.deployed().then(function(instance){
        return instance.get_ue_names.call(ii,{from:account});
      }).then(function(res){
        console.log(res);
        allUEs.push(res);
        return accept();
      }).catch(function(e){
        console.log(e);
        return reject();
      })
    });
  },

  fillAllUEList: function(){
    var select = document.getElementById("ueSelect");
    select.innerHTML = '';
    console.log(allUEs);
    console.log(allUEs.length);
    for(var i=0; i< allUEs.length; i++){
        var opt = allUEs[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
  },

  selectEnrollUE: function(){
    var select = document.getElementById("ueSelect");
    console.log(select.value);
    enrollUESelected = select.value;
  },

  enroll: function(){
    var name = document.getElementById("studentName").value;
    if(name && enrollUESelected){
      console.log(name);
      UEManager.deployed().then(function(instance){
        return instance.enroll.sendTransaction(name,enrollUESelected,{from:account,gas:470000});
      }).then(function(res){
        console.log(res);
      }).catch(function(e){
        console.log(e);
      })
    }
  },
  
  giveProfessorValidation: function(hash){
    UEManager.deployed().then(function(instance){
      return instance.giveProfessorValidation.sendTransaction(hash, {from:account});
    }).then(function(res){
      console.log(res);
    }).catch(function(e){
      console.log(e);
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

  App.start().then(function(){
    App.getEnrolledUEs();
    App.getAllUEs();
  });
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