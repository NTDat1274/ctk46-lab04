'use client'

import { useState, useEffect } from 'react'
import { addComment, deleteComment } from '@/app/actions/comment'
import { createClient } from '@/lib/supabase/client'
import { Trash2, User } from 'lucide-react'

type CommentType = {
  id: string
  content: string
  created_at: string
  author_id: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

export default function CommentSection({ 
  postId, 
  initialComments,
  currentUserId 
}: { 
  postId: string
  initialComments: CommentType[]
  currentUserId: string | undefined
}) {
  const [comments, setComments] = useState<CommentType[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    // Thiết lập Supabase Realtime để lắng nghe các thay đổi trên bảng comments
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Lắng nghe INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Lấy thêm thông tin profile của người vừa comment
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', payload.new.author_id)
              .single()

            const newCommentData = {
              ...payload.new,
              profiles: profile
            } as CommentType

            setComments((prev) => [newCommentData, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId) return
    
    setIsSubmitting(true)
    setError(null)
    
    const result = await addComment(postId, newComment)
    if (result.error) {
      setError(result.error)
    } else {
      setNewComment('')
    }
    
    setIsSubmitting(false)
  }

  async function handleDelete(commentId: string) {
    if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      const result = await deleteComment(commentId)
      if (result.error) {
        alert(result.error)
      }
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">Bình luận ({comments.length})</h3>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <label htmlFor="comment" className="sr-only">Nội dung bình luận</label>
            <textarea
              id="comment"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:ring-blue-500 focus:border-blue-500"
              placeholder="Viết bình luận của bạn..."
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-600">
          Bạn cần <a href="/login" className="text-blue-600 hover:underline font-medium">đăng nhập</a> để tham gia bình luận.
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4 bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex-shrink-0">
                {comment.profiles?.avatar_url ? (
                  <img src={comment.profiles.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">
                    {comment.profiles?.display_name || 'Người dùng ẩn danh'}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleString('vi-VN')}
                    </span>
                    {currentUserId === comment.author_id && (
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Xóa bình luận"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}