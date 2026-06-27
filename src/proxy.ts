import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "mini-mall-secret-key-change-in-production"
);

const ADMIN_PATHS = ["/admin", "/api/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (!isAdminPath) return NextResponse.next();

  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, error: "请先登录" },
      { status: 401 }
    );
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "无权限访问" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { success: false, error: "登录已过期，请重新登录" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
