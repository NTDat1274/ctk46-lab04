"use client";

import { useState } from "react";
import { login, loginWithGithub } from "@/app/actions/auth";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginForm({
  nextPath = "/dashboard",
}: {
  nextPath?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPasswordLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsPasswordLoading(false);
  }

  async function onSubmitGithub(formData: FormData) {
    setIsGithubLoading(true);
    setError(null);
    const result = await loginWithGithub(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsGithubLoading(false);
  }

  return (
    <div className="w-full space-y-4">
      <form action={onSubmit} className="space-y-4">
        <input type="hidden" name="next" value={nextPath} />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="m@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        <Button
          type="submit"
          disabled={isPasswordLoading || isGithubLoading}
          className="w-full"
        >
          {isPasswordLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Hoặc</span>
        </div>
      </div>

      <form action={onSubmitGithub}>
        <input type="hidden" name="next" value={nextPath} />
        <Button
          type="submit"
          variant="outline"
          disabled={isGithubLoading || isPasswordLoading}
          className="w-full"
        >
          {isGithubLoading
            ? "Đang chuyển đến GitHub..."
            : "Đăng nhập với GitHub"}
        </Button>
      </form>

      <div className="text-center text-sm mt-4 text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline font-medium"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
