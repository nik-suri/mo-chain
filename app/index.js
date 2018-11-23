/*
 * Express JS application to handle get/post requests for our p2p server
 * Each instance of application has its own wallet and copies of the blockchain and transaction pool
 * Each instance also becomes part of the p2p network on startup
 */
const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.post('/mine', (req, res) => {
  const block = bc.addBlock(req.body.data);
  console.log(`New block added: ${block.toString()}`);

  p2pServer.syncChains();

  res.redirect('/blocks');
});

app.post('/transact', (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, tp);

  p2pServer.broadcastTransaction(transaction);

  res.redirect('/transactions');
});

app.listen(HTTP_PORT, () => {
  console.log(`Listening on port ${HTTP_PORT}`);
});

p2pServer.listen()
