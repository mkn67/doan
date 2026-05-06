import Link from "next/link"
import { Users, ShieldAlert, CalendarDays, ClipboardList } from "lucide-react"

const adminModules = [
  {
    title: "Quản lý nhân sự",
    description: "Thêm, sửa, xóa thông tin nhân viên và cấp tài khoản.",
    href: "/staff/admin/employees",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Phân quyền hệ thống",
    description: "Thiết lập quyền truy cập cho Lễ tân, Bác sĩ...",
    href: "/staff/admin/roles",
    icon: ShieldAlert,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Quản lý lịch làm việc",
    description: "Sắp xếp lịch trực, ca làm việc cho nhân viên.",
    href: "/staff/admin/schedules",
    icon: CalendarDays,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Danh mục dịch vụ",
    description: "Cập nhật các gói khám mắt, đo khúc xạ, giá tiền.",
    href: "/staff/admin/services",
    icon: ClipboardList,
    color: "bg-emerald-50 text-emerald-600",
  },
]

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tổng quan Quản trị</h1>
        <p className="text-slate-500 mt-2">Chọn một phân hệ bên dưới để bắt đầu quản lý hệ thống Vision Care.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminModules.map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.href} href={module.href}>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group h-full">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${module.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{module.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{module.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}