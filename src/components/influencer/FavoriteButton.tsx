"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  influencerProfileId: string;
  initialIsFavorited?: boolean;
}

export function FavoriteButton({ influencerProfileId, initialIsFavorited = false }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  // Only show for brand users
  if (!session?.user) {
    return null;
  }

  const userType = (session.user as any).userType;
  if (userType !== "brand") {
    return null;
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card navigation
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFavorited) {
        // Remove favorite
        const res = await fetch(`/api/favorites/${influencerProfileId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to remove favorite");
        setIsFavorited(false);
      } else {
        // Add favorite
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ influencerProfileId }),
        });

        if (!res.ok) throw new Error("Failed to add favorite");
        setIsFavorited(true);
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={isLoading}
      className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm"
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
    </Button>
  );
}
