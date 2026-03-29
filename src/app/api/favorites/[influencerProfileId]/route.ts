import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/favorites/[influencerProfileId] - Remove a favorite
export async function DELETE(
  req: NextRequest,
  { params }: { params: { influencerProfileId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userType = (session.user as any).userType;
    if (userType !== "brand") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { influencerProfileId } = params;

    // Get brand profile
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!brandProfile) {
      return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
    }

    // Delete favorite
    await prisma.favorite.deleteMany({
      where: {
        brandProfileId: brandProfile.id,
        influencerProfileId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
