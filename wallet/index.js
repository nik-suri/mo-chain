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
  createTransaction(recipient, amount, transactionPool) {

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
}

module.exports = Wallet;
