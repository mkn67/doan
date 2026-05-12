export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-blue-600 text-white text-center py-20">
        <h1 className="text-4xl font-bold mb-4">
          Chăm sóc thị lực chuyên nghiệp
        </h1>
        <p>Khám mắt - Cắt kính - Tư vấn tận tâm</p>
      </section>

      {/* SERVICES */} 
      <section className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        <div className="border p-6 rounded-xl text-center">
          👁 Khám mắt
        </div>
        <div className="border p-6 rounded-xl text-center">
          👓 Cắt kính
        </div>
        <div className="border p-6 rounded-xl text-center">
          💬 Tư vấn
        </div>
      </section>
    </div>
  )
}