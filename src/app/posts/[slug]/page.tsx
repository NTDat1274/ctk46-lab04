import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import CommentSection from "@/components/posts/CommentSection";
import LikeButton from "@/components/posts/LikeButton";

export const revalidate = 60; // ISR revalidation

type Params = Promise<{ slug: string }>;
type CommentWithProfile = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export async function generateMetadata({ params }: { params: Params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .single();

  if (!post) {
    return { title: "Post Not Found | Simple Blog" };
  }

  return {
    title: `${post.title} | Simple Blog`,
    description: post.excerpt,
  };
}

export default async function PostDetailPage({ params }: { params: Params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Lấy chi tiết bài viết
  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content, status, created_at, author_id")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching post detail:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      slug,
    });
  }

  if (!post) {
    notFound();
  }

  const { data: authorProfile, error: authorProfileError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", post.author_id)
    .maybeSingle();

  if (authorProfileError) {
    console.error("Error fetching author profile:", {
      message: authorProfileError.message,
      code: authorProfileError.code,
      details: authorProfileError.details,
      hint: authorProfileError.hint,
      authorId: post.author_id,
    });
  }

  // Lấy tổng số lượt thích
  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", post.id);

  // Kiểm tra user hiện tại đã like chưa
  let isLiked = false;
  if (user) {
    const { data: userLike } = await supabase
      .from("likes")
      .select("post_id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .single();

    if (userLike) isLiked = true;
  }

  // Lấy danh sách bình luận ban đầu
  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("id, content, created_at, author_id")
    .eq("post_id", post.id)
    .order("created_at", { ascending: false });

  if (commentsError) {
    console.error("Error fetching comments:", {
      message: commentsError.message,
      code: commentsError.code,
      details: commentsError.details,
      hint: commentsError.hint,
      postId: post.id,
    });
  }

  const comments = commentsData ?? [];
  const commentAuthorIds = Array.from(
    new Set(comments.map((comment) => comment.author_id).filter(Boolean)),
  );

  let commentProfilesById = new Map<
    string,
    { display_name: string | null; avatar_url: string | null }
  >();

  if (commentAuthorIds.length > 0) {
    const { data: commentProfiles, error: commentProfilesError } =
      await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", commentAuthorIds);

    if (commentProfilesError) {
      console.error("Error fetching comment profiles:", {
        message: commentProfilesError.message,
        code: commentProfilesError.code,
        details: commentProfilesError.details,
        hint: commentProfilesError.hint,
        postId: post.id,
      });
    } else {
      commentProfilesById = new Map(
        commentProfiles.map((profile) => [
          profile.id,
          {
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
          },
        ]),
      );
    }
  }

  const commentsWithProfiles: CommentWithProfile[] = comments.map(
    (comment) => ({
      ...comment,
      profiles: commentProfilesById.get(comment.author_id) ?? null,
    }),
  );

  const authorName = authorProfile?.display_name || "Người dùng ẩn danh";

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl mb-4">
          {post.title}
        </h1>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <span>
            Bởi{" "}
            <span className="font-semibold text-gray-900">{authorName}</span>
          </span>
          <span>&middot;</span>
          <time dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.status === "draft" && (
            <>
              <span>&middot;</span>
              <span className="text-yellow-600 font-medium">Bản nháp</span>
            </>
          )}
        </div>
      </header>

      <div className="prose prose-blue prose-lg mx-auto text-gray-800">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-8">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Quay lại trang chủ
        </Link>
        <LikeButton
          postId={post.id}
          initialCount={likeCount || 0}
          initialLiked={isLiked}
          isLoggedIn={!!user}
        />
      </div>

      <CommentSection
        postId={post.id}
        initialComments={commentsWithProfiles}
        currentUserId={user?.id}
      />
    </article>
  );
}
