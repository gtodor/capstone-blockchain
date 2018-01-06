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
var ownedUEs = [];//all the ue where the student is enroled
var currentUEDisplayed;
var studentNames = [];
var studentAddresses = [];
var studentStatus = [];

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

  getOwnedUEs: function(){
      var self = this;
    UEManager.deployed().then(function(instance){
        console.log(account);
        return instance.get_owned_ue.call({from:account});
    }).then(function(res){
        console.log(res);
        var promises = res.map(function(addr){
            return new Promise(function(accept,reject){
                UEManager.deployed().then(function(instance){
                return instance.getUEAtAddress.call(addr,{from:this});
                }).then(function(res){
                    ownedUEs.push(res);
                    return accept();
                }).catch(function(e){
                    console.log(e);
                    return reject();
                })
            })
        })
        Promise.all(promises).then(function(){
            currentUEDisplayed = ownedUEs[0];
            self.displayOwnedUes();
            self.getEnrolledStudents();
        })
    }).catch(function(e){
        console.log(e);
    })
  },

  selectUEChanged: function(){
    var select = document.getElementById("ownedUE");
    var ue = select.value;
    var self = this;
    console.log(ue);
    document.getElementById("ownedUEName").innerHTML = ue;
    currentUEDisplayed = ue;
    this.getEnrolledStudents();
  },

  displayOwnedUes: function(){
    var select = document.getElementById("ownedUE");
    select.innerHTML = '';
    for(var i=0; i< ownedUEs.length; i++){
        var opt = ownedUEs[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
    document.getElementById('ownedUEName').innerHTML = currentUEDisplayed; 
  },


  createUE: function(){
      var self = this;
      UEManager.deployed().then(function(instance){
        var hash = document.getElementById("hashProfessor").value;
        var nomResponsable = document.getElementById("nomResponsable").value;
        var nomUE = document.getElementById("nomUE").value;
        var maxPlaces = parseInt(document.getElementById("maxPlaces").value);
        if(hash && nomResponsable && nomUE && maxPlaces){
            return instance.create_ue.sendTransaction(hash, nomResponsable, nomUE, maxPlaces,{from:account,gas:4700000});
        }else{
            return null;
        }
      }).then(function(res){
        if(res !== null){
            console.log(res);
            document.getElementById("infoCreateUE").innerHTML = "UE created successfully";
            //self.getOwnedUEs();    
        }else{
            console.log("must fill all cases");
        }
      }).catch(function(e){
          console.log(e);
      })
  },

  getEnrolledStudents: function(){
    var self = this;
      var ue = currentUEDisplayed;
      studentNames = [];
      studentAddresses = [];
      studentStatus = [];
      UEManager.deployed().then(function(instance){
          console.log("current UE is "+currentUEDisplayed);
          return instance.get_number_of_enrolled_students.call(currentUEDisplayed,{from:account});
      }).then(function(res){
          console.log(res.toNumber());
          var nb = res.toNumber();
          var promises = [];
          for(var i=0;i<nb;i++){
              promises.push(self.getName(i,ue));
          }
          Promise.all(promises).then(function(){
              var addrPromises = [];
              for(var i=0;i<nb;i++){
                addrPromises.push(self.getAddress(i,ue));
              }
              Promise.all(addrPromises).then(function(){
                  var statusPromises = [];
                  for(var i=0; i<nb;i++){
                    statusPromises.push(self.getStatus(i,ue));
                  }
                  Promise.all(statusPromises).then(function(){
                    self.fillTable();
                  })
              })
          })
      }).catch(function(e){
          console.log(e);
      })
  },

  getStatus: function(i,ue){
    return new Promise(function(accept,reject){
      var ii=new BigNumber(i);
      console.log(i);
      UEManager.deployed().then(function(instance){
        return instance.get_students_status.call(ii,ue,{from:account});
      }).then(function(res){
        console.log(res);
        studentStatus.push(res);
        return accept();
      }).catch(function(e){
        console.log(e);
        return reject();
      })
    });
  },

  getName: function(i,ue){
    return new Promise(function(accept,reject){
      var ii=new BigNumber(i);
      console.log(i);
      UEManager.deployed().then(function(instance){
        return instance.get_students_name.call(ii,ue,{from:account});
      }).then(function(res){
        console.log(res);
        studentNames.push(res);
        return accept();
      }).catch(function(e){
        console.log(e);
        return reject();
      })
    });
  },

  getAddress: function(i,ue){
    return new Promise(function(accept,reject){
      var ii=new BigNumber(i);
      console.log(i);
      UEManager.deployed().then(function(instance){
        return instance.get_students_address.call(ii,ue,{from:account});
      }).then(function(res){
        console.log(res);
        studentAddresses.push(res);
        return accept();
      }).catch(function(e){
        console.log(e);
        return reject();
      })
    });
  },

  fillTable: function(){
    var table = document.getElementById("tableBody");
    table.innerHTML = '';
    console.log(studentNames);
    for(var i=0; i<studentNames.length; i++){
      var tr= document.createElement("tr");
      var th = document.createElement("th");
      th.setAttribute("scope","row");
      th.textContent = i;
      var td1 = document.createElement("td");
      var td2 = document.createElement("td");
      var td3 = document.createElement("td");
      td1.textContent = studentNames[i];
      td2.textContent = studentAddresses[i];
      if(studentStatus[i] === false){
        td3.innerHTML = "<button class=\"btn btn-default\" onclick=\"App.validateStudentUE(this,"+i+")\">Validate</button>";
      }else{
        td3.innerHTML = "VALIDATED"
      }
      tr.appendChild(th);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      table.appendChild(tr);
    }
  },

  validateStudentUE: function(cell,i){
    console.log(i);
    console.log(currentUEDisplayed);
    console.log(studentAddresses[i]);
    var ue = currentUEDisplayed;
    var addr = studentAddresses[i];
    var self = this;
    UEManager.deployed().then(function(instance){
        return instance.validateUE.sendTransaction(ue, addr, {from:account});
    }).then(function(res){
        console.log(res);
        cell.innerHTML = "";
        cell.setAttribute('disabled',true);
        cell.innerHTML = "VALIDATED";
    }).catch(function(e){
        console.log(e);
    })
  },

  giveProfessorValidation: function(hash){
    UEManager.deployed().then(function(instance){
      return instance.giveProfessorValidation.sendTransaction(hash, {from:account});
    }).then(function(res){
      console.log(res);
    }).catch(function(e){
      console.log(e);
    })
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
      App.getOwnedUEs();
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