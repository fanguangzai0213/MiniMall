import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { success: false, error: "请填写完整信息" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { success: false, error: "密码不能少于6位" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: "该邮箱已被注册" },
      { status: 409 }
    );
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await setAuthCookie(token);

  return NextResponse.json({
    success: true,
    data: {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}
