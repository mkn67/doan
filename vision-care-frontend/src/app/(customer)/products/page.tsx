'use client'

import { useEffect, useState } from 'react'

const fakeProducts = [
  {
    id: 1,
    name: 'Kính Rayban Classic',
    price: 1500000,
    image: 'https://via.placeholder.com/300',
  },
  {
    id: 2,
    name: 'Kính Gentle Monster',
    price: 2200000,
    image: 'https://via.placeholder.com/300',
  },
  {
    id: 3,
    name: 'Kính Gucci',
    price: 3000000,
    image: 'https://via.placeholder.com/300',
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    setProducts(fakeProducts)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Danh sách kính</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="border rounded-xl p-4">
            <img src={p.image} className="mb-3 rounded" />
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-blue-600">{p.price.toLocaleString()}đ</p>
          </div>
        ))}
      </div>
    </div>
  )
}