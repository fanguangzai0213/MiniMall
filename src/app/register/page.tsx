import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getAuthUser();
  if (user) redirect("/");

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-zinc-900">
            Mini Mall
          </Link>
          <p className="mt-2 text-sm text-zinc-500">创建新账号</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
