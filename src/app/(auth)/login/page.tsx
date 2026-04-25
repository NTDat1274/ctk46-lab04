import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Simple Blog",
  description: "Đăng nhập vào tài khoản của bạn",
};

function getSafeNextPath(value: string | string[] | undefined) {
  const nextValue = typeof value === "string" ? value : "/dashboard";

  if (!nextValue.startsWith("/") || nextValue.startsWith("//")) {
    return "/dashboard";
  }

  return nextValue;
}

function getReasonMessage(value: string | string[] | undefined) {
  const reason = typeof value === "string" ? value : "";

  if (reason === "auth_required") {
    return "Bạn cần đăng nhập để truy cập trang này.";
  }

  if (reason === "oauth_failed") {
    return "Đăng nhập GitHub thất bại. Vui lòng thử lại.";
  }

  if (reason === "reset_invalid") {
    return "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
  }

  if (reason === "password_updated") {
    return "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.";
  }

  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const nextPath = getSafeNextPath(resolvedParams.next);
  const reasonMessage = getReasonMessage(resolvedParams.reason);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Đăng nhập
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chào mừng bạn quay lại với Simple Blog
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {reasonMessage && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {reasonMessage}
              </div>
            )}
            <LoginForm nextPath={nextPath} />
          </div>
        </div>
      </div>
    </div>
  );
}
