import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center font-mono">
      <div className="text-center max-w-lg px-6">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-black text-[#00ff41] mb-4" style={{ textShadow: '0 0 20px rgba(0,255,65,0.4)' }}>
          PAYMENT CONFIRMED
        </h1>
        <p className="text-gray-300 mb-2">
          Your Wealth Machine is activating.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Check your email for access instructions. Setup takes 10 minutes.
        </p>
        <div className="space-y-3">
          <Link
            href="/sell"
            className="block px-6 py-3 rounded-lg bg-[#00ff41] text-[#0a0e27] font-black text-sm hover:bg-[#00dd33] transition"
          >
            ← BACK TO DASHBOARD
          </Link>
        </div>
        <p className="text-[10px] text-gray-600 mt-8">
          Questions? Reply to the email you just received.
        </p>
      </div>
    </div>
  );
}
