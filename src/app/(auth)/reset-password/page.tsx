import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | Simple Blog",
  description: "Cập nhật mật khẩu mới cho tài khoản",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tạo mật khẩu mới để tiếp tục sử dụng tài khoản.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {user ? (
              <ResetPasswordForm />
            ) : (
              <div className="space-y-3 text-sm text-gray-700">
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                  Phiên khôi phục không hợp lệ hoặc đã hết hạn.
                </p>
                <p>
                  Bạn có thể yêu cầu liên kết mới tại trang{" "}
                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline font-medium"
                  >
                    Quên mật khẩu
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
