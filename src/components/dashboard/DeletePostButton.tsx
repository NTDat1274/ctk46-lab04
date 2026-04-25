'use client'

import { useState } from 'react'
import { deletePost } from '@/app/actions/post'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DeletePostButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    await deletePost(id)
    // revalidatePath in server action will refresh the page
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          className="text-red-600 hover:text-red-900 hover:bg-red-50"
          title="Xóa bài viết"
        />
      }>
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn xóa bài viết này?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Bài viết này sẽ bị xóa vĩnh viễn khỏi máy chủ của chúng tôi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Xóa bài viết</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
