import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json(
      { success: false, error: "未登录" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { id: true, email: true, name: true, role: true, tier: true, totalSpent: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "用户不存在" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: user });
}
