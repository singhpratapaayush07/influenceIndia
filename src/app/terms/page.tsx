import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-4">Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
            <p className="text-gray-600 leading-relaxed">
              Welcome to InfluenceIndia. By accessing or using our platform, you agree to be bound by these Terms of Service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By creating an account or using InfluenceIndia, you agree to these terms and our Privacy Policy.
              If you do not agree, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">User Accounts</h2>
            <p className="text-gray-600 leading-relaxed mb-2">
              When you create an account, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">User Conduct</h2>
            <p className="text-gray-600 leading-relaxed mb-2">You agree NOT to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Provide false or misleading information</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload malicious code or content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Scrape or harvest data from the platform</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Collaborations and Payments</h2>
            <p className="text-gray-600 leading-relaxed">
              InfluenceIndia facilitates connections between brands and influencers. All collaboration agreements,
              payments, and deliverables are between the brand and influencer directly. We are not responsible for
              the outcome of collaborations or payment disputes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on InfluenceIndia, including text, graphics, logos, and software, is the property of
              InfluenceIndia or its licensors and is protected by intellectual property laws.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these terms or engage in
              fraudulent activity. You may also delete your account at any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              InfluenceIndia is provided "as is" without warranties of any kind. We are not liable for any indirect,
              incidental, or consequential damages arising from your use of the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms of Service from time to time. Continued use of the platform after changes
              constitutes acceptance of the new terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about these Terms of Service, please contact us through our platform support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
