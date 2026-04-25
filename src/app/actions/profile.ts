'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const displayName = formData.get('displayName') as string
  const avatarUrl = formData.get('avatarUrl') as string

  // TODO: Xử lý upload file lên Storage ở đây nếu có file
  // (Trong spec có đề cập đến Storage, nhưng để đơn giản ta dùng URL trực tiếp trước)

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      avatar_url: avatarUrl || null,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}