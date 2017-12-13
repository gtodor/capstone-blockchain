// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: 4,
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
