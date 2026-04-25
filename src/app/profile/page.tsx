import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/profile/ProfileForm'

export const metadata = {
  title: 'Hồ sơ cá nhân | Simple Blog',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch thông tin profile từ bảng profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="mt-2 text-sm text-gray-600">
          Cập nhật thông tin hiển thị của bạn trên Simple Blog.
        </p>
      </div>

      <ProfileForm 
        initialData={{
          email: user.email || '',
          displayName: profile?.display_name || '',
          avatarUrl: profile?.avatar_url || ''
        }}
      />
    </div>
  )
}