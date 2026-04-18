'use client';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="p-8 bg-white rounded-xl shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Đăng nhập VisionCare</h1>
        <p className="text-zinc-500 mb-6">Chào mừng bạn quay trở lại!</p>
        <Button className="w-full">Đăng nhập ngay</Button>
      </div>
    </div>
  );
}
