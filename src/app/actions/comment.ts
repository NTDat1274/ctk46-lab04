'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(postId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Bạn cần đăng nhập để bình luận.' }
  }

  if (!content.trim()) {
    return { error: 'Nội dung bình luận không được để trống.' }
  }

  const { error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim()
    })

  if (error) {
    return { error: error.message }
  }

  // Next.js cache revalidation
  revalidatePath(`/posts/[slug]`, 'page')
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('author_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/posts/[slug]`, 'page')
  return { success: true }
}