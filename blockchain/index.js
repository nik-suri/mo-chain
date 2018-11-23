const Block = require('./block');

class Blockchain {

  // new chain contains only genesis block
  constructor() {
    this.chain = [Block.genesis()];
  }

  // mine a new block for some data
  addBlock(data) {
    const lastBlock = this.chain[this.chain.length - 1];
    const block = Block.mineBlock(lastBlock, data);
    this.chain.push(block);
    return block;
  }

  // check validity of another chain by comparing against our own
  isValidChain(chain) {

    // check genesis
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    // make sure all hashes in the chain match up and we get the same hash value when we try to hash
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];

      if (block.lastHash !== lastBlock.hash || block.hash !== Block.blockHash(block)) {
        return false;
      }
    }

    return true;
  }

  // replace our chain with another chain
  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log('Received chain is not longer than current chain.');
      return;
    }

    if (!this.isValidChain(newChain)) {
      console.log('Received chain is not valid.');
      return;
    }

    console.log("Replacing blockchain with the new chain...");
    this.chain = newChain;
  }
}

module.exports = Blockchain;
