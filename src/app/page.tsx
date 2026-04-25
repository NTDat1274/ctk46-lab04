import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const revalidate = 60; // Revalidate trang mỗi 60 giây (ISR)
const POSTS_PER_PAGE = 6;

function getPageFromSearchParams(value: string | string[] | undefined) {
  const raw = typeof value === "string" ? value : "1";
  const page = Number.parseInt(raw, 10);

  if (Number.isNaN(page) || page < 1) {
    return 1;
  }

  return page;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = getPageFromSearchParams(resolvedParams.page);
  const from = (currentPage - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const supabase = await createClient();

  // Fetch published posts
  const {
    data: postsData,
    error,
    count,
  } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, created_at, author_id", {
      count: "exact",
    })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching posts:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  const totalPosts = count ?? 0;
  const totalPages =
    totalPosts > 0 ? Math.ceil(totalPosts / POSTS_PER_PAGE) : 0;

  if (totalPages > 0 && currentPage > totalPages) {
    redirect(totalPages === 1 ? "/" : `/?page=${totalPages}`);
  }

  const authorIds = Array.from(
    new Set((postsData ?? []).map((post) => post.author_id).filter(Boolean)),
  );

  let profilesById = new Map<
    string,
    { display_name: string | null; avatar_url: string | null }
  >();

  if (authorIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", authorIds);

    if (profilesError) {
      console.error("Error fetching profiles:", {
        message: profilesError.message,
        code: profilesError.code,
        details: profilesError.details,
        hint: profilesError.hint,
      });
    } else {
      profilesById = new Map(
        profiles.map((profile) => [
          profile.id,
          {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
          },
        ]),
      );
    }
  }

  const posts = (postsData ?? []).map((post) => ({
    ...post,
    profile: profilesById.get(post.author_id) ?? null,
  }));

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = totalPages > 0 && currentPage < totalPages;
  const previousPageHref =
    currentPage - 1 <= 1 ? "/" : `/?page=${currentPage - 1}`;
  const nextPageHref = `/?page=${currentPage + 1}`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Bài viết mới nhất
          </h2>
        </div>
      </div>

      {!posts || posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              Chưa có bài viết nào được xuất bản.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const authorName =
              post.profile?.display_name || "Người dùng ẩn danh";

            return (
              <Card
                key={post.id}
                className="flex flex-col overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="line-clamp-3 text-base">
                    {post.excerpt || "Không có nội dung tóm tắt."}
                  </CardDescription>
                </CardContent>
                <CardFooter className="bg-muted/50 border-t px-6 py-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {authorName}
                  </span>
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleDateString("vi-VN")}
                  </time>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {hasPreviousPage ? (
            <Link
              href={previousPageHref}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Trang trước
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400">
              Trang trước
            </span>
          )}

          <span className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages}
          </span>

          {hasNextPage ? (
            <Link
              href={nextPageHref}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Trang sau
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400">
              Trang sau
            </span>
          )}
        </div>
      )}
    </div>
  );
}
