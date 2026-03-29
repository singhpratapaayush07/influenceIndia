import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { CampaignForm } from "@/components/campaign/CampaignForm";

export default async function NewCampaignPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = session.user as any;
  if (user.userType !== "brand") redirect("/");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/dashboard/brand/campaigns">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <p className="text-sm text-gray-500">
            Create a campaign brief to receive proposals from matching influencers
          </p>
        </CardHeader>
        <CardContent>
          <CampaignForm />
        </CardContent>
      </Card>
    </div>
  );
}
