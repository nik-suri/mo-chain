const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction {

  // unique id
  // input is peer making transaction
  // could be > 2 outputs if transaction is added to transaction pool before block for transaction is mined
  constructor() {
    this.id = ChainUtil.id();
    this.input = null;
    this.outputs = [];
  }

  // update with another output
  update(senderWallet, recipient, amount) {

    // find output already generated for the sender
    const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);

    // make sure we have enough for another transaction
    if (amount > senderOutput.amount) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    // update the sender's amount in output list (sender's new balance)
    senderOutput.amount -= amount;
    this.outputs.push({ amount, address: recipient });

    // transaction must be re-signed
    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  // create a transaction object from the sender with initial outputs
  static transactionWithOutputs(senderWallet, outputs) {
    const transaction = new this();
    transaction.outputs.push(...outputs);
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }

  // create a new transaction from senderWallet to recipient
  // recipient is a public key (wallet address)
  static newTransaction(senderWallet, recipient, amount) {
    // make sure we have enough
    if (amount > senderWallet.balance) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    // always at least 2 outputs
    // 1) our new balance
    // 2) amount sent to recipient
    const initialOutputs = [
      { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
      { amount, address: recipient }
    ];

    return Transaction.transactionWithOutputs(senderWallet, initialOutputs);
  }

  // transaction from blockchain to reward a miner
  static rewardTransaction(minerWallet, blockchainWallet) {
    const outputs = [{ amount: MINING_REWARD, address: minerWallet.publicKey }];
    return Transaction.transactionWithOutputs(blockchainWallet, outputs);
  }

  // set the input for a transaction
  // made up of a timestamp, sender's original balance, sender's public key, signature generated by sender
  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
    };
  }

  // verify transaction using sender's public key, generated signature, and hash of the outputs
  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      ChainUtil.hash(transaction.outputs)
    );
  }
}

module.exports = Transaction;
