'use client'

import { useState, useRef } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { uploadImage } from '@/app/actions/storage'
import { User, Upload, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type ProfileFormProps = {
  initialData: {
    displayName: string | null
    avatarUrl: string | null
    email: string
  }
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || '')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const result = await uploadImage(formData)
    
    if (result.error) {
      setError(result.error)
    } else if (result.url) {
      setAvatarUrl(result.url)
    }
    
    setIsUploading(false)
  }

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    // Đảm bảo URL ảnh mới được submit
    formData.set('avatarUrl', avatarUrl)
    
    const result = await updateProfile(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Cập nhật hồ sơ thành công!')
    }
    setIsLoading(false)
  }

  return (
    <Card>
      <form action={onSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col items-center justify-center mb-8 relative">
            <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 overflow-hidden mb-4 group relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Upload className="h-6 w-6 text-white" />}
              </div>
            </div>
            <p className="text-sm text-gray-500">Email: {initialData.email}</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input 
              id="displayName" 
              name="displayName" 
              type="text" 
              defaultValue={initialData.displayName || ''}
              placeholder="Nhập tên hiển thị của bạn..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL Ảnh đại diện</Label>
            <Input 
              id="avatarUrl" 
              name="avatarUrl" 
              type="url" 
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
          {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded font-medium">{success}</div>}
        </CardContent>
        
        <CardFooter className="pt-4 border-t bg-gray-50/50">
          <Button 
            type="submit" 
            disabled={isLoading || isUploading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}