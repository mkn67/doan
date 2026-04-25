import { useMutation } from '@tanstack/react-query';
import { staffApi } from '@/lib/api/staff.api';
import { XuLyKinhRequestDTO } from '@/types/staff';

// Màn hình Kỹ thuật viên (Xưởng mài kính)
export const useCreateXuLyKinh = () => {
  return useMutation({
    mutationFn: (data: XuLyKinhRequestDTO) => staffApi.createPhieuXuLyKinh(data),
  });
};