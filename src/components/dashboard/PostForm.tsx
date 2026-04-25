'use client'

import { useState, useRef } from 'react'
import { createPost, updatePost } from '@/app/actions/post'
import { uploadImage } from '@/app/actions/storage'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type PostFormProps = {
  initialData?: {
    id: string
    title: string
    content: string
    excerpt: string | null
    status: 'draft' | 'published'
  }
}

export default function PostForm({ initialData }: PostFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [content, setContent] = useState(initialData?.content || '')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const isEditing = !!initialData

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const result = await uploadImage(formData)
    
    if (result.error) {
      alert(`Lỗi upload ảnh: ${result.error}`)
    } else if (result.url) {
      // Chèn markdown hình ảnh vào nội dung
      const imageMarkdown = `\n![Image](${result.url})\n`
      setContent(prev => prev + imageMarkdown)
    }
    
    setIsUploading(false)
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    // Cập nhật lại content từ state phòng trường hợp textarea không tự đồng bộ
    formData.set('content', content)
    
    let result
    if (isEditing && initialData) {
      result = await updatePost(initialData.id, formData)
    } else {
      result = await createPost(formData)
    }

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <form action={onSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề bài viết</Label>
            <Input 
              id="title" 
              name="title" 
              type="text" 
              required 
              defaultValue={initialData?.title}
              placeholder="Nhập tiêu đề..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Đoạn trích (Tóm tắt)</Label>
            <Textarea 
              id="excerpt" 
              name="excerpt" 
              rows={3}
              defaultValue={initialData?.excerpt || ''}
              placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Nội dung (hỗ trợ Markdown)</Label>
              
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <Button 
                  type="button" 
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-8 px-2 text-blue-600"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-1" />}
                  <span>{isUploading ? 'Đang tải lên...' : 'Chèn ảnh'}</span>
                </Button>
              </div>
            </div>
            
            <Textarea 
              id="content" 
              name="content" 
              required
              rows={15}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono text-sm"
              placeholder="# Tiêu đề lớn&#10;**Đậm** và *Nghiêng*..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select name="status" defaultValue={initialData?.status || 'draft'}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="published">Xuất bản</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-4 border-t pt-6 bg-gray-50/50">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || isUploading}
          >
            {isLoading ? 'Đang lưu...' : (isEditing ? 'Cập nhật bài viết' : 'Tạo bài viết mới')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}