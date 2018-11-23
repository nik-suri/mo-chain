const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const uuidV1 = require('uuid/v1');
const ec = new EC('secp256k1');

class ChainUtil {

  // generate public and private key pair
  static genKeyPair() {
    return ec.genKeyPair();
  }

  // generate unique id
  static id() {
    return uuidV1();
  }

  // generic hash function on some data
  static hash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }

  // verify hashed data using given publicKey and signature
  static verifySignature(publicKey, signature, dataHash) {
    return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
  }
}

module.exports = ChainUtil;
