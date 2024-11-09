import React, { useEffect } from 'react';
import { useBSVsCrypt } from './useBSVsCrypt';
import contractDesc from './path/to/your/compiled/contract.json';

export default function MyComponent() {
  const {
    wallet,
    balance,
    transactionHistory,
    error,
    initializeWallet,
    loadContract,
    deployContract,
    callContractFunction,
  } = useBSVsCrypt();

  useEffect(() => {
    initializeWallet('your-private-key-wif');
  }, []);

  const handleDeployContract = async () => {
    loadContract(contractDesc, [/* constructor args */]);
    const result = await deployContract();
    console.log('Contract deployed:', result);
  };

  const handleCallFunction = async () => {
    const result = await callContractFunction('someFunction', [/* function args */], /* utxo */);
    console.log('Function called:', result);
  };

  return (
    <div>
      <h1>BSV sCrypt DApp</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Address: {wallet ? wallet.address : 'Not initialized'}</p>
      <p>Balance: {balance} satoshis</p>
      <h2>Transaction History</h2>
      <ul>
        {transactionHistory.map((tx) => (
          <li key={tx.txid}>
            TxID: {tx.txid} - Confirmed: {tx.confirmed}
          </li>
        ))}
      </ul>
      <button onClick={handleDeployContract}>Deploy Contract</button>
      <button onClick={handleCallFunction}>Call Contract Function</button>
    </div>
  );
}
