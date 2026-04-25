các mutation chỉ có onSuccess, không xử lý lỗi. Khi API fail, React Query vẫn throw error nhưng component sẽ không biết để hiển thị thông báo.
👉 Thêm onError hoặc xử lý lỗi toàn cục qua useMutation options hoặc error boundary. Ví dụ:

ts
useMutation({
  mutationFn: ...,
  onError: (error) => {
    console.error(error);
    // toast.error(error.message);
  }
})