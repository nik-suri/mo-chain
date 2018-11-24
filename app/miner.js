const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

class Miner {
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mine() {
    const validTransactions = this.transactionPool.validTransactions();

    // include a reward for the miner
    const rewardTransaction = Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet());
    validTransactions.push(rewardTransaction);

    // create a block consisting of the valid transactions
    const block = this.blockchain.addBlock(validTransactions);

    // sync chains in the p2p server
    this.p2pServer.syncChains();

    // clear the transaction pool and broadcast this info to all other miners as well
    this.transactionPool.clear();
    this.p2pServer.broadcastClearTransactions();

    return block;
  }
}

module.exports = Miner;
