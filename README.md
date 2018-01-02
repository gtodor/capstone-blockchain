# Projet Capstone 2017-2018

Web app représentant un systeme d'inscription/validation des UE qui fonctionne comme un smart contrat sur l'ethereum.


### Requirements:
- Nodejs minimum version 5.0
- Npm minimum version 3.0

# Installation
Install the latest version of Nodejs and Npm:
https://nodejs.org/en/

For linux users: 
```sh
sudo apt-get install -y nodejs
```

The application directory is /blockchain-app

Now you need to install truffle using NPM:
- Go to the application directory and use the following command
```sh
npm install truffle
```

OR

- Install it globally for all your applications with the following command

```sh
npm install -g truffle
```

- Go to the application directory and run
```sh
npm install
```
AND
```sh
truffle compile
```
```truffle migrate --network <development or rinkeby>```

after you need the addresses of the deployed contracts so:

```truffle networks``` and copy address of ue_manager then :

```truffle console```

in the console

```SmartIdentity.deployed().then(function(inst){ return inst.setOwner('<ue_manager address>');})```

then copy the address of SmartIdentity (use ```truffle networks```) and do in the console:

```ue_manager.deployed().then(function(inst){ return inst.createSmartId('<SmartIdentity address>')```

- Check the doc file:  https://github.com/gtodor/capstone-blockchain/blob/master/documentation/liste.md

- You should be able to run the application now, just start the dev script
```sh
npm run dev
```
**Important!** For some users the default port for EthereumJS is not 9545, in that case use the following command when you run TestRPC:
```sh
testrpc -p 9545
```
Make sure you are using this adress for the provider in the app.js: http://127.0.0.1:9545


