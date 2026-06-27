import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ success: false, error: "请填写完整信息" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: "邮箱格式不正确" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ success: false, error: "密码不能少于6位" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // 不暴露邮箱是否已注册
    await hashPassword("dummy");
    const token = await signToken({ userId: existing.id, email: "", name: "", role: existing.role });
    await setAuthCookie(token);
    return NextResponse.json({
      success: true,
      data: { userId: existing.id, email: existing.email, name: existing.name, role: existing.role },
    });
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  const token = await signToken({
    userId: user.id,
    email: "",
    name: "",
    role: user.role,
  });

  await setAuthCookie(token);

  return NextResponse.json({
    success: true,
    data: { userId: user.id, email: user.email, name: user.name, role: user.role },
  });
}
