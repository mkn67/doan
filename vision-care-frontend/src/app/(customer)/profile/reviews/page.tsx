"use client";

import React, { useState } from "react";
import { Star, MessageSquareHeart, Send, CheckCircle2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// MOCK DATA: Chờ m viết API nối vào sau
const pendingReview = {
  maHoSo: "HS_S04",
  ngayKham: "08/05/2026",
  bacSi: "BS. Nguyễn Thị Hương",
  dichVu: "Khám mắt tổng quát"
};

const pastReviews = [
  {
    id: "REV01",
    maHoSo: "HS_S01",
    ngayKham: "10/12/2025",
    bacSi: "BS. Đặng Thu Diễm",
    soSao: 5,
    noiDung: "Bác sĩ khám rất kỹ và tận tâm. Phòng khám sạch sẽ, máy móc hiện đại. Kính cắt xong đeo rất êm mắt không bị nhức đầu."
  },
  {
    id: "REV02",
    maHoSo: "HS_S02",
    ngayKham: "15/08/2025",
    bacSi: "BS. Đặng Thu Diễm",
    soSao: 4,
    noiDung: "Dịch vụ tốt, nhưng hôm đó cuối tuần nên chờ lấy kính hơi lâu một chút. Mong phòng khám cải thiện tốc độ mài kính."
  }
];

export default function CustomerReviewsPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Xử lý gửi đánh giá
  const handleSubmitReview = () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá nhé!");
      return;
    }
    
    setIsSubmitting(true);
    // Giả lập call API (Sau này m dùng useCreateDanhGia ở đây)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="p-3 bg-pink-100 text-pink-600 rounded-xl">
          <MessageSquareHeart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đánh Giá & Phản Hồi</h1>
          <p className="text-slate-500 text-sm mt-1">Chia sẻ trải nghiệm của bạn để Vision Care phục vụ tốt hơn.</p>
        </div>
      </div>

      {/* SECTION 1: CHỜ ĐÁNH GIÁ (Pending) */}
      {!isSubmitted ? (
        <Card className="border-pink-200 shadow-md bg-gradient-to-br from-white to-pink-50/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10" />
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Lần khám gần nhất cần đánh giá</CardTitle>
            <CardDescription>Hồ sơ {pendingReview.maHoSo} • Khám ngày {pendingReview.ngayKham}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-800">{pendingReview.dichVu}</p>
                <p className="text-sm text-slate-500 mt-0.5">Phụ trách: {pendingReview.bacSi}</p>
              </div>
              
              {/* STAR RATING INTERACTIVE */}
              <div className="flex items-center gap-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-all hover:scale-110 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-300"
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Chia sẻ thêm về trải nghiệm của bạn (Không bắt buộc)</label>
              <Textarea 
                placeholder="Bác sĩ khám có kỹ không? Cơ sở vật chất thế nào? Kính đeo có ưng ý không..."
                className="min-h-[120px] bg-white resize-none"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                className="bg-pink-600 hover:bg-pink-700 shadow-md gap-2 px-8 h-11"
                onClick={handleSubmitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang gửi..." : <><Send className="w-4 h-4" /> Gửi đánh giá</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* THÔNG BÁO CẢM ƠN KHI ĐÃ GỬI XONG */
        <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm text-center py-10">
          <CardContent>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Cảm ơn bạn đã đánh giá!</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Phản hồi của bạn đã được ghi nhận. Vision Care sẽ luôn nỗ lực cải thiện để mang đến dịch vụ tốt nhất.
            </p>
          </CardContent>
        </Card>
      )}

      {/* SECTION 2: LỊCH SỬ ĐÃ ĐÁNH GIÁ (Past Reviews) */}
      <div className="pt-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Đánh giá trước đây của bạn</h2>
        <div className="space-y-4">
          {pastReviews.map((review) => (
            <Card key={review.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {/* Render Stars tĩnh */}
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= review.soSao ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-slate-700 ml-1">{review.soSao}/5</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-600">{review.bacSi}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                    <Calendar className="w-3.5 h-3.5" />
                    {review.ngayKham}
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                  <MessageSquareHeart className="absolute top-4 right-4 w-12 h-12 text-slate-200/50" />
                  <p className="text-slate-700 text-sm italic relative z-10">&quot;{review.noiDung}&quot;</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}