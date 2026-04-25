import PostForm from '@/components/dashboard/PostForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Chỉnh sửa bài viết | Dashboard',
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    notFound()
  }

  const { data: post, error } = await supabase
    .from('posts')
    .select('id, title, content, excerpt, status, author_id')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  if (post.author_id !== user.id) {
    // Không có quyền sửa bài viết của người khác
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Lỗi truy cập</h1>
        <p>Bạn không có quyền chỉnh sửa bài viết này.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa bài viết</h1>
      </div>
      
      <PostForm 
        initialData={{
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          status: post.status as 'draft' | 'published'
        }} 
      />
    </div>
  )
}