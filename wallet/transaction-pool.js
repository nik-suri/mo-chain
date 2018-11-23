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
}

module.exports = TransactionPool;
