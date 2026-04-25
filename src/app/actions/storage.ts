'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  // Convert File to ArrayBuffer for Supabase Storage
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    return { error: error.message }
  }

  // Lấy Public URL
  const { data: publicUrlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath)

  return { url: publicUrlData.publicUrl }
}