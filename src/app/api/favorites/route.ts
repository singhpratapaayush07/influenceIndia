import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/favorites - Get all favorites for the current brand
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userType = (session.user as any).userType;
    if (userType !== "brand") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get brand profile
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!brandProfile) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

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

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

// POST /api/favorites - Add a favorite
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userType = (session.user as any).userType;
    if (userType !== "brand") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { influencerProfileId } = await req.json();

    if (!influencerProfileId) {
      return NextResponse.json({ error: "Missing influencerProfileId" }, { status: 400 });
    }

    // Get brand profile
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!brandProfile) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

    // Create favorite (will be ignored if already exists due to unique constraint)
    const favorite = await prisma.favorite.upsert({
      where: {
        brandProfileId_influencerProfileId: {
          brandProfileId: brandProfile.id,
          influencerProfileId,
        },
      },
      create: {
        brandProfileId: brandProfile.id,
        influencerProfileId,
      },
      update: {},
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}
