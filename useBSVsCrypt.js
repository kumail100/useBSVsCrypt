import { useState, useEffect, useCallback } from 'react';
import { bsv } from 'bsv';
import { buildContractClass, toHex, getPreimage, SigHash } from 'scryptlib';

export const useBSVsCrypt = () => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [contract, setContract] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [error, setError] = useState(null);

  // Initialize BSV Wallet
  const initializeWallet = (privateKeyWif) => {
    try {
      const privateKey = bsv.PrivateKey.fromWIF(privateKeyWif);
      const address = privateKey.toAddress();
      setWallet({ privateKey, address });
      fetchBalance(address);
      fetchTransactionHistory(address);
    } catch (err) {
      setError(`Failed to initialize wallet: ${err.message}`);
    }
  };

  // Fetch Balance
  const fetchBalance = async (address) => {
    try {
      const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/address/${address}/balance`);
      const data = await response.json();
      setBalance(data.confirmed);
    } catch (err) {
      setError(`Failed to fetch balance: ${err.message}`);
    }
  };

  // Fetch Transaction History
  const fetchTransactionHistory = async (address) => {
    try {
      const response = await fetch(`https://api.whatsonchain.com/v1/bsv/main/address/${address}/txs`);
      const data = await response.json();
      setTransactionHistory(data);
    } catch (err) {
      setError(`Failed to fetch transaction history: ${err.message}`);
    }
  };

  // Load sCrypt Contract
  const loadContract = (contractDesc, args) => {
    try {
      const ContractClass = buildContractClass(contractDesc);
      const instance = new ContractClass(...args);
      setContract(instance);
    } catch (err) {
      setError(`Failed to load contract: ${err.message}`);
    }
  };

  // Deploy Contract
  const deployContract = async (feeRate = 0.5) => {
    if (!contract || !wallet) return null;

    try {
      const tx = new bsv.Transaction();
      tx.addInput(new bsv.Transaction.Input({
        prevTxId: '',
        outputIndex: 0,
        script: '',
        sequenceNumber: 0xffffffff,
      }));

      // Add contract output with locking script
      tx.addOutput(new bsv.Transaction.Output({
        script: contract.lockingScript,
        satoshis: balance - feeRate,
      }));

      // Sign transaction
      const privateKey = wallet.privateKey;
      tx.sign(privateKey);
      const rawTx = tx.serialize();

      // Broadcast transaction
      const result = await fetch('https://api.whatsonchain.com/v1/bsv/main/tx/raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawtx: rawTx }),
      });
      return await result.json();
    } catch (err) {
      setError(`Failed to deploy contract: ${err.message}`);
    }
  };

  // Call Contract Function
  const callContractFunction = async (functionName, args, utxo, feeRate = 0.5) => {
    if (!contract || !wallet) return null;

    try {
      const preimage = getPreimage(tx, contract.lockingScript, utxo.satoshis);
      const unlockingScript = contract[functionName](...args).toScript();
      
      const tx = new bsv.Transaction()
        .from(utxo)
        .addOutput(new bsv.Transaction.Output({
          script: unlockingScript,
          satoshis: utxo.satoshis - feeRate,
        }))
        .sign(wallet.privateKey);
        
      const rawTx = tx.serialize();
      const result = await fetch('https://api.whatsonchain.com/v1/bsv/main/tx/raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawtx: rawTx }),
      });
      return await result.json();
    } catch (err) {
      setError(`Failed to call contract function: ${err.message}`);
    }
  };

  // Listen for Contract Events (Placeholder for sCrypt library support)
  const listenForEvents = useCallback(() => {
    if (!contract) return;
    // Assuming the contract has a way to emit events, which might need custom implementation.
    contract.on('event', (eventData) => {
      console.log('Contract Event:', eventData);
    });
  }, [contract]);

  useEffect(() => {
    if (contract) listenForEvents();
  }, [contract, listenForEvents]);

  return {
    wallet,
    balance,
    transactionHistory,
    error,
    initializeWallet,
    loadContract,
    deployContract,
    callContractFunction,
    fetchBalance,
    fetchTransactionHistory,
  };
};
