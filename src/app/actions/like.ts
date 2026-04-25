'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Bạn cần đăng nhập để thích bài viết.' }
  }

  // Kiểm tra xem đã like chưa
  const { data: existingLike } = await supabase
    .from('likes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
    
    return { liked: false }
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: user.id
      })

    if (error) return { error: error.message }
    
    return { liked: true }
  }
}