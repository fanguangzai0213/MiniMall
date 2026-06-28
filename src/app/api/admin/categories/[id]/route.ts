import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "无权限访问" }, { status: 403 });
  }

  const { id } = await params;
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) {
    return NextResponse.json({ success: false, error: "无效的分类ID" }, { status: 400 });
  }

  const { name, slug } = await request.json();
  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
    },
  });

  return NextResponse.json({ success: true, data: category });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "无权限访问" }, { status: 403 });
  }

  const { id } = await params;
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) {
    return NextResponse.json({ success: false, error: "无效的分类ID" }, { status: 400 });
  }

  await prisma.category.delete({ where: { id: categoryId } });

  return NextResponse.json({ success: true });
}
