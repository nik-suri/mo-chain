const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {

  // information to be stored in each block
  // including difficulty is optional
  constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY;
  }

  toString() {
    return `Block -
            Timestamp : ${this.timestamp}
            Last Hash : ${this.lastHash.substring(0, 10)}
            Hash      : ${this.hash.substring(0, 10)}
            Nonce     : ${this.nonce}
            Difficulty: ${this.difficulty}
            Data      : ${this.data}`;
  }

  // create genesis block
  // no lastHash, no data, nonce is 0, difficulty is default
  static genesis() {
    return new this('Genesis time', '-------', 'f1r57-h45h', [], 0, DIFFICULTY);
  }

  // mine a new block using the most recent block and some data
  static mineBlock(lastBlock, data) {
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;

    // proof of work algorithm
    let hash, timestamp;
    let nonce = 0;
    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);
      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this(timestamp, lastHash, hash, data, nonce, difficulty);
  }

  // hash data for a block
  static hash(timestamp, lastHash, data, nonce, difficulty) {
    return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`);
  }

  // hash a block
  static blockHash(block) {
    const {timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }

  // called after a new block is mined
  // if mined too quickly, increase difficulty
  // if mined too slowly, decrease difficulty
  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty } = lastBlock;
    difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
    return difficulty;
  }
}

module.exports = Block;
