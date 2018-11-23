const Websocket = require('ws');
const P2P_PORT = process.env.P2P_PORT || 5001;

// testing use case: we can run this on a port with set local peers
// $ HTTP_PORT= 3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION'
};

class P2pServer {

  // each peer has a copy of the blockchain and the pool of transactions
  // also has a list of other peers (sockets)
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
  }

  // start our server, connect to network, listen for new connections to network
  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    server.on('connection', socket => this.connectSocket(socket));
    this.connectToPeers();
    console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
  }

  // connect to each peer given in peers (our starting network)
  connectToPeers() {
    peers.forEach(peer => {
      // peer is an address such as: ws://localhost:5001
      const socket = new Websocket(peer)
      socket.on('open', () => this.connectSocket(socket));
    });
  }

  // connect to a new peer
  // set up message handling
  // send new peer a copy of our blockchain
  connectSocket(socket) {
    this.sockets.push(socket);
    console.log('Socket connected.');

    this.messageHandler(socket);

    this.sendChain(socket);
  }

  // handle receiving a blockchain or transaction from a peer
  messageHandler(socket) {
    socket.on('message', message => {
      const data = JSON.parse(message);
      switch(data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
      }
    });
  }

  // send a copy of our blockchain to a peer
  sendChain(socket) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.chain,
      chain: this.blockchain.chain
    }));
  }

  // send a transaction to a peer
  sendTransaction(socket, transaction) {
    socket.send(JSON.stringify({
      type: MESSAGE_TYPES.transaction,
      transaction
    }));
  }

  // make sure network is up to date with the latest chain
  syncChains() {
    this.sockets.forEach(socket => this.sendChain(socket));
  }

  // make sure network is aware of a transaction
  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
  }
}

module.exports = P2pServer;
