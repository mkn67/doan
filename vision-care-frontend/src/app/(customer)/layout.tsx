'use client'
import CustomerHeader from "@/components/customer/CustomerHeader"
import CustomerFooter from "@/components/customer/CustomerFooter"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />

      {/* CONTENT */}
      <main className="flex-1">{children}</main>
      <CustomerFooter />
    </div>
  )
}