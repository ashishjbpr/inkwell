import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entries } = await req.json();
  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ imported: 0 });
  }

  const { count } = await prisma.entry.createMany({
    data: entries.map((e) => ({
      id: e.id,
      title: e.title,
      content: e.content,
      mood: e.mood,
      tags: e.tags ?? [],
      isFavorite: e.isFavorite ?? false,
      isPinned: e.isPinned ?? false,
      colorFlag: e.colorFlag,
      location: e.location,
      weather: e.weather,
      createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
      updatedAt: e.updatedAt ? new Date(e.updatedAt) : undefined,
      userId: session.user.id,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ imported: count });
}
