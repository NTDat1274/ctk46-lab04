import RegisterForm from '@/components/auth/RegisterForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng ký | Simple Blog',
  description: 'Tạo tài khoản mới',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bắt đầu chia sẻ câu chuyện của bạn
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}