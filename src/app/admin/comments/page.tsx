import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { deleteAdminComment } from "@/app/actions/admin"

export default async function AdminCommentsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(display_name), posts(title)")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Comments</h2>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-1/3">Content</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Author</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">On Post</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {comments?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 align-middle text-center text-muted-foreground">
                      No comments found.
                    </td>
                  </tr>
                ) : (
                  comments?.map((comment) => (
                    <tr key={comment.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <p className="line-clamp-2">{comment.content}</p>
                      </td>
                      <td className="p-4 align-middle">{(comment.profiles as any)?.display_name || 'Unknown'}</td>
                      <td className="p-4 align-middle">
                        <p className="line-clamp-1 font-medium">{(comment.posts as any)?.title || 'Deleted Post'}</p>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle">
                        <form action={async () => {
                          "use server"
                          await deleteAdminComment(comment.id)
                        }}>
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-destructive hover:bg-destructive/10 h-9 px-3"
                          >
                            Delete
                          </button>
                        </form>
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
  )
}
