import Link from "next/link";
import { TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-purple-700 mb-3">
              <TrendingUp className="h-5 w-5" />
              InfluenceIndia
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              India&apos;s largest influencer marketplace. Connecting brands with verified creators across every niche.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/influencers" className="hover:text-purple-700">Browse Influencers</Link></li>
              <li><Link href="/signup?type=brand" className="hover:text-purple-700">For Brands</Link></li>
              <li><Link href="/signup?type=influencer" className="hover:text-purple-700">For Influencers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="cursor-default">About Us</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
          © {new Date().getFullYear()} InfluenceIndia. Made with ❤️ in India.
        </div>
      </div>
    </footer>
  );
}
