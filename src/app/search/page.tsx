import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";

export const metadata = {
  title: "Tìm kiếm | Simple Blog",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const query =
    typeof resolvedParams.q === "string" ? resolvedParams.q.trim() : "";

  const supabase = await createClient();

  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    created_at: string;
    author_id: string;
    profile: {
      display_name: string | null;
      avatar_url: string | null;
    } | null;
  }> = [];
  let error = null;

  if (query) {
    const searchPattern = `%${query}%`;

    const [titleSearch, contentSearch] = await Promise.all([
      supabase
        .from("posts")
        .select("id, title, slug, excerpt, created_at, author_id")
        .eq("status", "published")
        .ilike("title", searchPattern)
        .order("created_at", { ascending: false }),
      supabase
        .from("posts")
        .select("id, title, slug, excerpt, created_at, author_id")
        .eq("status", "published")
        .ilike("content", searchPattern)
        .order("created_at", { ascending: false }),
    ]);

    if (titleSearch.error || contentSearch.error) {
      error = titleSearch.error || contentSearch.error;
    } else {
      const mergedPostsMap = new Map<
        string,
        {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          created_at: string;
          author_id: string;
        }
      >();

      [...(titleSearch.data || []), ...(contentSearch.data || [])].forEach(
        (post) => {
          mergedPostsMap.set(post.id, post);
        },
      );

      const mergedPosts = Array.from(mergedPostsMap.values()).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      const authorIds = Array.from(
        new Set(mergedPosts.map((post) => post.author_id).filter(Boolean)),
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
          error = profilesError;
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

      posts = mergedPosts.map((post) => ({
        ...post,
        profile: profilesById.get(post.author_id) ?? null,
      }));
    }
  }

  if (error) {
    console.error("Search error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      query,
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tìm kiếm</h1>
        <form action="/search" method="GET" className="flex gap-2">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Tìm kiếm bài viết..."
              className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Tìm
          </button>
        </form>
      </div>

      {query && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Kết quả tìm kiếm cho &quot;{query}&quot; ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500">
                Không tìm thấy bài viết nào phù hợp.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {post.excerpt || "Không có nội dung tóm tắt."}
                  </p>
                  <div className="text-sm text-gray-500">
                    Bởi {post.profile?.display_name || "Ẩn danh"} &middot;{" "}
                    {new Date(post.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
