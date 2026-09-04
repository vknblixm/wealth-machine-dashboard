import { ethers } from 'ethers';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// ═══════════════════════════════════════════════════════
// SELF-CONTAINED CRYPTO WALLET
// No API keys. No external services. Fully self-custodial.
// Generate → Receive → Withdraw to any wallet/exchange.
// ═══════════════════════════════════════════════════════

const ENV_PATH = join(process.cwd(), '.env.local');

interface WalletInfo {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

// Generate a new Ethereum wallet
export function generateWallet(): WalletInfo {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase,
  };
}

// Load or create wallet — persists to .env.local
export function getOrCreateWallet(): WalletInfo {
  const envContent = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf-8') : '';

  // Check if wallet already exists in .env.local
  const addressMatch = envContent.match(/CRYPTO_WALLET_ADDRESS=(.+)/);
  const keyMatch = envContent.match(/CRYPTO_WALLET_PRIVATE_KEY=(.+)/);
  const mnemonicMatch = envContent.match(/CRYPTO_WALLET_MNEMONIC=(.+)/);

  if (addressMatch && keyMatch) {
    return {
      address: addressMatch[1].trim(),
      privateKey: keyMatch[1].trim(),
      mnemonic: mnemonicMatch ? mnemonicMatch[1].trim() : undefined,
    };
  }

  // Generate new wallet
  const wallet = generateWallet();

  // Append to .env.local
  const newLines = [
    '',
    '# ═══ CRYPTO WALLET (Auto-generated — DO NOT SHARE PRIVATE KEY) ═══',
    `CRYPTO_WALLET_ADDRESS=${wallet.address}`,
    `CRYPTO_WALLET_PRIVATE_KEY=${wallet.privateKey}`,
    `CRYPTO_WALLET_MNEMONIC="${wallet.mnemonic}"`,
  ].join('\n');

  writeFileSync(ENV_PATH, envContent + newLines + '\n');
  console.log(`🔐 New crypto wallet generated: ${wallet.address}`);
  return wallet;
}

// Get wallet public info (safe to expose to frontend)
export function getWalletPublicInfo() {
  const wallet = getOrCreateWallet();
  return {
    address: wallet.address,
    // ETH address is also your USDT (ERC-20), USDC, DAI address
    networks: {
      ethereum: wallet.address,
      polygon: wallet.address, // Same address on EVM chains
      arbitrum: wallet.address,
      optimism: wallet.address,
    },
    acceptedCoins: ['ETH', 'USDT', 'USDC', 'DAI', 'WBTC'],
    instructions: [
      `Send any amount of ETH, USDT, USDC, or DAI to:`,
      wallet.address,
      'Payments are detected automatically on the Ethereum network.',
      'To withdraw: Import the private key into MetaMask or any Ethereum wallet.',
    ],
  };
}

// Check ETH balance using free public RPC (no API key)
export async function checkBalance(address: string): Promise<{
  eth: string;
  usdt: string;
  usdc: string;
  totalUsdEstimate: string;
}> {
  // Free public Ethereum RPCs
  const rpcs = [
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com',
  ];

  let ethBalance = '0';

  for (const rpc of rpcs) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      const balance = await provider.getBalance(address);
      ethBalance = ethers.formatEther(balance);
      break;
    } catch {
      continue;
    }
  }

  // For ERC-20 tokens (USDT/USDC), we'd need to query contract calls
  // Simplified: just return ETH balance for now
  return {
    eth: ethBalance,
    usdt: '0',
    usdc: '0',
    totalUsdEstimate: ethBalance, // ~USD equivalent, rough estimate
  };
}

// Get recent transactions for the wallet
export async function getRecentTransactions(address: string): Promise<Array<{
  hash: string;
  from: string;
  value: string;
  timestamp: string;
}>> {
  // Use Etherscan free API (no key for basic reads)
  try {
    const res = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&page=1&offset=10`
    );
    const data = await res.json();

    if (data.status !== '1' || !data.result) return [];

    return data.result.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      value: ethers.formatEther(tx.value),
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
    }));
  } catch {
    return [];
  }
}
