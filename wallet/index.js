const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');
const { INITIAL_BALANCE } = require('../config');

class Wallet {

  // set balance and generate a public/private key pair
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtil.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  toString() {
    return `Wallet -
      publicKey: ${this.publicKey.toString()}
      balance: ${this.balance}`;
  }

  // generate a signature for some hashed data
  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }

  // make a transaction to some recipient
  // effect is to update or add to the current transaction pool
  createTransaction(recipient, amount, blockchain, transactionPool) {
    // first we recalculate user's balance
    this.balance = this.calculateBalance(blockchain);

    // invalid transaction
    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds the current balance ${this.balance}.`);
      return;
    }

    // check for an existing transaction from our address in the transaction pool
    let transaction = transactionPool.existingTransaction(this.publicKey);

    if (transaction) {
      transaction.update(this, recipient, amount);
    } else {
      transaction = Transaction.newTransaction(this, recipient, amount);
      transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }

  // calculate balance for a user using the blocks in the blockchain
  calculateBalance(blockchain) {
    let balance = this.balance;

    // get all transactions in blockchain
    let transactions = [];
    blockchain.chain.forEach(block => block.data.forEach(t => {
      transactions.push(t);
    }));

    // start time of most recent transaction made by user
    let startTime = 0;

    // find all transactions made by the user
    const walletInputTs = transactions.filter(t => t.input.address === this.publicKey);

    // if user made any outgoing transactions
    if (walletInputTs.length > 0) {

      // find most recent transaction
      const recentInputT = walletInputTs.reduce(
        (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
      );

      // find the output in this transaction which gives the user's new balance
      balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
      startTime = recentInputT.input.timestamp;
    }

    // from the point of the most recent transaction, add up any incoming transactions for this user
    transactions.forEach(t => {
      if (t.input.timestamp > startTime) {
        t.outputs.forEach(output => {
          if (output.address === this.publicKey) {
            balance += output.amount;
          }
        });
      }
    });

    return balance;
  }

  // create a wallet from the blockchain
  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.address = 'blockchain-wallet';
    return blockchainWallet;
  }
}

module.exports = Wallet;
