import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ success: false, error: "请输入邮箱和密码" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // 统一错误提示，不暴露用户是否存在
    return NextResponse.json({ success: false, error: "邮箱或密码错误" }, { status: 401 });
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ success: false, error: "邮箱或密码错误" }, { status: 401 });
  }

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
