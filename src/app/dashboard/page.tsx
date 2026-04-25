import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeletePostButton from "@/components/dashboard/DeletePostButton";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | Simple Blog",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?reason=auth_required&next=/dashboard");
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, status, created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi khi fetch posts:", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">
            Quản lý bài viết
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Danh sách tất cả các bài viết của bạn. Bạn có thể sửa, xóa hoặc tạo
            bài mới từ đây.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button render={<Link href="/dashboard/new" />} nativeButton={false}>
            Viết bài mới
          </Button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg border">
              <table className="min-w-full divide-y divide-gray-300 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Tiêu đề
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Ngày tạo
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Hành động</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!posts || posts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-sm text-gray-500"
                      >
                        Bạn chưa có bài viết nào.
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50/50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {post.title}
                          {post.status === "published" && (
                            <Link
                              href={`/posts/${post.slug}`}
                              className="ml-2 text-primary text-xs hover:underline"
                              target="_blank"
                            >
                              (Xem)
                            </Link>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              post.status === "published"
                                ? "bg-green-50 text-green-700 ring-green-600/20"
                                : "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
                            }`}
                          >
                            {post.status === "published"
                              ? "Đã xuất bản"
                              : "Bản nháp"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex justify-end space-x-2 items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:text-primary/80"
                            render={
                              <Link
                                href={`/dashboard/edit/${post.id}`}
                                title="Sửa bài"
                              />
                            }
                            nativeButton={false}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DeletePostButton id={post.id} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
