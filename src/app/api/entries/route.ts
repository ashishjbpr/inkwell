import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ENTRY_SELECT } from "@/lib/entrySelect";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.entry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: ENTRY_SELECT,
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    id,
    title,
    content,
    mood,
    tags,
    isFavorite,
    isPinned,
    colorFlag,
    location,
    weather,
    createdAt,
  } = body;

  const entry = await prisma.entry.create({
    data: {
      id,
      title,
      content,
      mood,
      tags: tags ?? [],
      isFavorite: isFavorite ?? false,
      isPinned: isPinned ?? false,
      colorFlag,
      location,
      weather,
      createdAt: createdAt ? new Date(createdAt) : undefined,
      userId: session.user.id,
    },
    select: ENTRY_SELECT,
  });

  return NextResponse.json(entry, { status: 201 });
}
