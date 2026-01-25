# Testing Checklist

## Pre-flight Checks
- [ ] .env file created with all keys
- [ ] MetaMask installed and on Sepolia
- [ ] Have Sepolia ETH in wallet
- [ ] Contract address in constants.js
- [ ] Contract ABI in constants.js
- [ ] Pinata API keys configured

## Installation
```bash
cd frontend
npm install
npm run dev
```

## Test Sequence

### 1. Wallet Connection
- [ ] Open http://localhost:5173
- [ ] Click "Connect Wallet"
- [ ] MetaMask popup appears
- [ ] Wallet connects successfully
- [ ] Address shown in header
- [ ] Network badge shows "Sepolia"

### 2. Register Product
- [ ] Navigate to /register
- [ ] Fill form:
  - Name: "Test Product"
  - Origin: "Test Location"
  - Category: "Electronics"
- [ ] Click "Register Product"
- [ ] IPFS upload starts (check console)
- [ ] Transaction sent (MetaMask popup)
- [ ] Confirm transaction
- [ ] Wait for confirmation
- [ ] Product ID returned
- [ ] Success message shown
- [ ] Check console for logs

### 3. Update Location
- [ ] Navigate to /update
- [ ] Enter product ID from step 2
- [ ] Click "Load Product"
- [ ] Product details appear
- [ ] Fill update form:
  - Location: "New Location"
  - Status: "In Transit"
- [ ] Click "Update Location"
- [ ] IPFS upload (check console)
- [ ] Transaction sent
- [ ] Confirm in MetaMask
- [ ] Success message

### 4. Verify Product
- [ ] Navigate to /verify
- [ ] Enter product ID
- [ ] Click "Verify"
- [ ] Product details load
- [ ] History shows initial + update
- [ ] All data correct

### 5. Dashboard
- [ ] Navigate to /dashboard
- [ ] See your products listed
- [ ] Count matches expected

## Common Issues

### Contract calls fail
- Check contract address is correct
- Check ABI is correct
- Check network is Sepolia
- Check you have test ETH

### IPFS upload fails
- Check Pinata API keys
- Check internet connection
- Check console for errors

### Transaction fails
- Check you're a stakeholder
- Check sufficient gas
- Check product ID exists (for updates)
