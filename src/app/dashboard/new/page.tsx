import PostForm from '@/components/dashboard/PostForm'

export const metadata = {
  title: 'Viết bài mới | Dashboard',
}

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Viết bài mới</h1>
        <p className="mt-2 text-sm text-gray-600">
          Chia sẻ kiến thức và câu chuyện của bạn với mọi người.
        </p>
      </div>
      
      <PostForm />
    </div>
  )
}