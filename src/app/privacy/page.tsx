import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-4">Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
            <p className="text-gray-600 leading-relaxed">
              At InfluenceIndia, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Account information (name, email, password)</li>
              <li>Profile information (company details, social media handles, etc.)</li>
              <li>Communication data (messages, collaboration requests)</li>
              <li>Usage data (how you interact with our platform)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-2">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Provide and maintain our services</li>
              <li>Match brands with relevant influencers</li>
              <li>Process collaboration requests and campaigns</li>
              <li>Communicate with you about your account</li>
              <li>Improve our platform and user experience</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us through our platform support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
