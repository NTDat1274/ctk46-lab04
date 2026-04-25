'use client'

import { useState } from 'react'
import { toggleLike } from '@/app/actions/like'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LikeButton({ 
  postId, 
  initialLiked, 
  initialCount,
  isLoggedIn
}: { 
  postId: string
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để thích bài viết này.')
      router.push('/login')
      return
    }

    setIsLoading(true)
    
    // Optimistic UI update
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

    const result = await toggleLike(postId)
    
    if (result.error) {
      // Revert if error
      setIsLiked(isLiked)
      setLikeCount(initialCount)
      alert(result.error)
    }

    setIsLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border transition-colors ${
        isLiked 
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
      <span className="font-medium">{likeCount} lượt thích</span>
    </button>
  )
}