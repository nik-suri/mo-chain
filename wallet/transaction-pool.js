const Transaction = require('./transaction');

class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  // if transaction is in pool, update (reset) it. if not, add it
  updateOrAddTransaction(transaction) {
    let transactionWithId = this.transactions.find(t => t.id === transaction.id);

    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
    } else {
      this.transactions.push(transaction);
    }
  }

  // true/false depending on if there is a transaction from address already present in the pool
  existingTransaction(address) {
    return this.transactions.find(t => t.input.address === address);
  }

  // return a list of transactions that are valid in this transaction pool
  validTransactions() {
    return this.transactions.filter(t => {
      const outputTotal = t.outputs.reduce((acc, output) => acc + output.amount, 0);

      if (t.input.amount !== outputTotal) {
        console.log(`Invalid transaction from ${t.input.address}.`);
        return;
      }

      if (!Transaction.verifyTransaction(t)) {
        console.log(`Invalid signature from ${t.input.address}.`);
        return;
      }

      return t;
    });
  }

  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;
