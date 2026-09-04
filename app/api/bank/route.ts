import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════
// BANK/EFT PAYMENT DETAILS
// Returns bank account info for manual EFT transfers
// eWallet number is NOT exposed — shared only after contact
// ═══════════════════════════════════════════════════════

export async function GET() {
  return NextResponse.json({
    bank: process.env.BANK_NAME || 'FNB (First National Bank)',
    accountName: process.env.BANK_ACCOUNT_NAME || 'Rochelle Venter',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '63147649371',
    branchCode: process.env.BANK_BRANCH_CODE || '250655',
    accountType: process.env.BANK_ACCOUNT_TYPE || 'Savings',
    swiftCode: process.env.BANK_SWIFT_CODE || 'FIRNZAJJ',
    reference: process.env.BANK_REFERENCE_FORMAT || 'PR-[YOUR_NAME]',
    instructions: process.env.BANK_EFT_INSTRUCTIONS || 'Use your email as reference. Payment clears instantly for FNB, 24hrs for other banks.',
    
    // eWallet is available but number is hidden for privacy
    // Customer must contact us to get the eWallet number
    ewallet: {
      available: true,
      bank: 'FNB eWallet',
      note: 'eWallet available — message us on WhatsApp to get the number after placing your order.',
      contactEmail: 'bonabots801@gmail.com',
      contactWhatsApp: '+27 662 169 789',
    },

    pricing: [
      { name: 'Starter', zar: 'R899', usd: '$47' },
      { name: 'Pro', zar: 'R5,499', usd: '$297' },
      { name: 'Empire', zar: 'R54,999', usd: '$2,997' },
    ],
    acceptedMethods: [
      'FNB EFT / Instant Payment (fastest)',
      'Other bank EFT (ABSA, Standard Bank, Nedbank, Capitec)',
      'Immediate Payment (amounts under R50,000)',
      'FNB eWallet (message us for number)',
    ],
    note: 'After payment, send your proof of payment to bonabots801@gmail.com with your name and chosen plan. We activate within 1 hour.',
  });
}
