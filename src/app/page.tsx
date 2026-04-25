import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const revalidate = 60; // Revalidate trang mỗi 60 giây (ISR)

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch published posts
  const { data: postsData, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, created_at, author_id")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
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
    </div>
  );
}
