import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About InfluenceIndia</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            InfluenceIndia is India's premier influencer marketing platform, connecting brands with authentic creators across diverse niches.
            We empower brands to find the perfect influencer partners and enable creators to monetize their content and grow their influence.
          </p>

          <h2 className="text-xl font-semibold mb-3 mt-6">What We Do</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our platform provides a seamless experience for both brands and influencers:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li>Smart matching algorithm connecting brands with relevant influencers</li>
            <li>Transparent pricing and performance metrics</li>
            <li>Secure messaging and collaboration tools</li>
            <li>Campaign management and proposal systems</li>
            <li>Verified profiles to ensure authenticity</li>
          </ul>

          <h2 className="text-xl font-semibold mb-3 mt-6">Why Choose Us</h2>
          <p className="text-gray-600 leading-relaxed">
            With InfluenceIndia, you get access to India's largest network of verified influencers, advanced analytics,
            and a platform built specifically for the Indian market. We understand the unique dynamics of influencer marketing
            in India and provide tools tailored to your needs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
