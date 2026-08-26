import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">৪০৪ - পেজটি পাওয়া যায়নি</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          আপনি যে পেজটি খুঁজছেন তা হয়তো সরানো হয়েছে বা লিংকটি সঠিক নয়।
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all"
        >
          <Home className="w-4 h-4" />
          <span>মূল পাতায় ফিরে যান</span>
        </Link>
      </div>
    </div>
  );
}
