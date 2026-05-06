export const useAuth = () => {
  return {
    login: (data: any) => {
      localStorage.setItem('username', data.username)
      window.location.href = '/'
    },
    register: () => alert('Đăng ký thành công'),
    isLoading: false,
    error: '',
  }
}