Overview of useBSVsCrypt Plugin Features
Key Features
sCrypt Contract Management

Deploy and instantiate sCrypt smart contracts
Call functions within sCrypt contracts
Listen for events from sCrypt contracts
Transaction Handling

Create, sign, and broadcast transactions with BSV
Generate and manage private/public keys
Wallet Management

Import and manage BSV wallets
Fund wallet addresses for contract deployment
Retrieve wallet balances and transaction history
Utilities for BSV Data Processing

Parse and format BSV transaction data
Decode and encode BSV-specific data types

In your package.json, you’ll need some dependencies:

bash
Copy code
npm install bsv scryptlib react
bsv is for handling BSV transactions.
scryptlib is the official sCrypt library for JavaScript.
