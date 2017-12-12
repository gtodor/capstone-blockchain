// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: 4,
      from: "0x5964AE7a0E47BB971ac609a9D8327e8e9Fa24D03",
      gas: 4700000
    },
    development: {
      host: '127.0.0.1',
      port: 9545,
      network_id: '*' // Match any network id
    }
  },
  solc: { optimizer: { enabled: true, runs: 200 } }
}
