import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { LogOut, User as UserIcon, Edit, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 justify-between items-center">
          <div className="flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">Simple Blog</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" render={<Link href="/search" title="Tìm kiếm" />} nativeButton={false}>
              <Search className="h-5 w-5" />
            </Button>
            
            {user ? (
              <>
                <Button className="hidden sm:flex" render={<Link href="/dashboard/new" />} nativeButton={false}>
                  <Edit className="h-4 w-4 mr-2" />
                  Viết bài
                </Button>
                <Button variant="ghost" render={<Link href="/dashboard" />} nativeButton={false}>
                  Dashboard
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" render={<Link href="/profile" title="Hồ sơ cá nhân" />} nativeButton={false}>
                  <UserIcon className="h-5 w-5" />
                </Button>
                <form action={logout}>
                  <Button variant="ghost" size="icon" type="submit" className="text-muted-foreground hover:text-foreground" title="Đăng xuất">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button variant="ghost" render={<Link href="/login" />} nativeButton={false}>
                  Đăng nhập
                </Button>
                <Button render={<Link href="/register" />} nativeButton={false}>
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
