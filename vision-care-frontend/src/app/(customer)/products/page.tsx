"use client";

import React, { useState } from "react";
import { Search, ShoppingCart, Eye, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 1. MOCK DATA: Nâng cấp hình ảnh và thêm phân loại (Khớp với CSDL của m)
const fakeProducts = [
  {
    id: "SP006",
    category: "Gọng kính",
    name: "Gọng Kim Loại Titanium Siêu Nhẹ",
    price: 850000,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop",
    tag: "Bán chạy",
  },
  {
    id: "SP001",
    category: "Tròng kính",
    name: "Tròng CR-39 Đơn Tụ Chống UV",
    price: 350000,
    image:
      "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800&auto=format&fit=crop",
    tag: "Khuyên dùng",
  },
  {
    id: "SP002",
    category: "Tròng kính",
    name: "Tròng Poly Siêu Mỏng Chống Xước",
    price: 650000,
    image:
      "https://images.unsplash.com/photo-1585642363533-87586561f558?q=80&w=800&auto=format&fit=crop",
    tag: "Mới",
  },
  {
    id: "SP010",
    category: "Gọng kính",
    name: "Gọng Nhựa Acetate Cao Cấp",
    price: 1200000,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop",
    tag: "",
  },
  {
    id: "SP011",
    category: "Kính mát",
    name: "Kính Râm Phân Cực Chống Lóa",
    price: 1500000,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop",
    tag: "Hot",
  },
  {
    id: "SP009",
    category: "Thuốc",
    name: "Dung dịch nhỏ mắt Rohto 15ml",
    price: 45000,
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5e12f6023?q=80&w=800&auto=format&fit=crop",
    tag: "",
  },
];

const CATEGORIES = ["Tất cả", "Gọng kính", "Tròng kính", "Kính mát", "Thuốc"];

export default function ProductsPage() {
  const [products] = useState(fakeProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  // Logic lọc sản phẩm theo Search và Tabs
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      activeCategory === "Tất cả" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HERO SECTION BANNER */}
      <div className="bg-slate-900 text-white pt-16 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/20 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Khám phá bộ sưu tập{" "}
            <span className="text-blue-400">Vision Care</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Gọng kính thời trang, tròng kính công nghệ cao và các sản phẩm chăm
            sóc mắt đạt chuẩn y khoa.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        {/* FILTER & SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 flex flex-col md:flex-row gap-4 justify-between items-center mb-10 border border-slate-100">
          {/* TABS CATEGORY */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* SEARCH BOX */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm kính mắt..."
              className="pl-10 bg-slate-50 border-transparent focus:bg-white focus:border-blue-400 rounded-xl h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                {/* IMAGE CONTAINER */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer">
                  {p.tag && (
                    <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wide rounded-full flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3" /> {p.tag}
                    </div>
                  )}
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* OVERLAY ACTIONS (Màn hình máy tính mới hiện khi hover) */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/90 hover:bg-white text-slate-900"
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/90 hover:bg-white text-blue-600"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    {p.category}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </h3>

                  {/* PRICE & ACTION */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                    <p className="text-lg font-black text-blue-600">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(p.price)}
                    </p>
                    <Button
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 text-xs px-4 rounded-lg hidden sm:flex"
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-slate-500 mt-1">
              Vui lòng thử lại với từ khóa hoặc danh mục khác.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
