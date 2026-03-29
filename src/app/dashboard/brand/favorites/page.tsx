import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InfluencerCard } from "@/components/influencer/InfluencerCard";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

async function getFavorites(userId: string) {
  // Get brand profile
  const brandProfile = await prisma.brandProfile.findUnique({
    where: { userId },
  });

  if (!brandProfile) return [];

  // Get all favorites
  const favorites = await prisma.favorite.findMany({
    where: { brandProfileId: brandProfile.id },
    include: {
      influencerProfile: {
        include: {
          pricing: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites.map(f => ({
    ...f.influencerProfile,
    niches: (f.influencerProfile.niches as unknown as string[]) || [],
    languages: (f.influencerProfile.languages as unknown as string[]) || [],
  }));
}

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userType = (session.user as any).userType;
  if (userType !== "brand") {
    redirect("/dashboard/" + userType);
  }

  const favorites = await getFavorites(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
        <p className="text-gray-500 mt-1">Influencers you have saved for later</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No favorites yet</h3>
            <p className="text-gray-400 mt-1">
              Browse influencers and click the heart icon to save them here
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{favorites.length} favorite{favorites.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer as any} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
