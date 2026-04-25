'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const status = formData.get('status') as 'draft' | 'published'

  // Server-side validation
  if (!title || !content) {
    return { error: 'Title and content are required' }
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000);

  const { error } = await supabase.from('posts').insert({
    title,
    content,
    excerpt,
    status,
    slug,
    author_id: user.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
  redirect('/dashboard')
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const excerpt = formData.get('excerpt') as string
  const status = formData.get('status') as 'draft' | 'published'

  if (!title || !content) {
    return { error: 'Title and content are required' }
  }

  const updateData: any = {
    title,
    content,
    excerpt,
    status,
  }

  // Update published_at only if transitioning to published
  if (status === 'published') {
    updateData.published_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id)
    .eq('author_id', user.id) // Ensure user owns the post

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
  // Can't easily use slug here unless we fetch it, redirecting to dashboard is safe
  redirect('/dashboard')
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
}