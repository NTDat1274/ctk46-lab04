'use client'

import { useState } from 'react'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
    }
    setIsLoading(false)
  }

  return (
    <form action={onSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input 
          id="fullName" 
          name="fullName" 
          type="text" 
          required 
          placeholder="Nguyễn Văn A"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          required 
          placeholder="m@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          required 
        />
      </div>
      
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
      </Button>

      <div className="text-center text-sm mt-4 text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Đăng nhập
        </Link>
      </div>
    </form>
  )
}