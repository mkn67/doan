"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquareHeart, Send, CheckCircle2, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useLichSuKham, useDanhGiaByKh, useCreateDanhGia } from "@/hooks/useClinic";

export default function CustomerReviewsPage() {
  const { user } = useAuth();
  const maKh = user?.maKh || "";

  // Get customer examination history and past reviews
  const { data: historyRes, isLoading: historyLoading } = useLichSuKham(maKh);
  const { data: reviewsRes, isLoading: reviewsLoading } = useDanhGiaByKh(maKh);
  const createMutation = useCreateDanhGia();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const realHistory = historyRes?.data || [];
  const pastReviews = reviewsRes || [];

  // Filter out checkups that have already been reviewed
  const reviewedHoSoSet = new Set(pastReviews.map((r: any) => r.maHoSo).filter(Boolean));
  const pendingReviews = realHistory.filter((h: any) => !reviewedHoSoSet.has(h.maHoSo));
  const pendingReview = pendingReviews.length > 0 ? pendingReviews[0] : null;

  const handleSubmitReview = () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá nhé!");
      return;
    }
    if (!pendingReview) {
      alert("Không tìm thấy hồ sơ khám cần đánh giá!");
      return;
    }

    createMutation.mutate({
      maHoSo: pendingReview.maHoSo,
      maKh: maKh,
      maNs: pendingReview.maNs || "BS01",
      soSao: rating,
      noiDung: reviewText
    }, {
      onSuccess: () => {
        setRating(0);
        setReviewText("");
        alert("✅ Cảm ơn bạn đã gửi đánh giá!");
      },
      onError: (err: any) => {
        console.error("Gửi đánh giá lỗi:", err);
        alert("❌ Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!");
      }
    });
  };

  const isLoading = historyLoading || reviewsLoading;

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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
        </div>
      ) : (
        <>
          {/* SECTION 1: CHỜ ĐÁNH GIÁ (Pending) */}
          {pendingReview ? (
            <Card className="border-pink-200 shadow-md bg-gradient-to-br from-white to-pink-50/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10" />
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Lần khám gần nhất chưa đánh giá</CardTitle>
                <CardDescription>
                  Hồ sơ {pendingReview.maHoSo} • Khám ngày {pendingReview.ngayKham ? new Date(pendingReview.ngayKham).toLocaleDateString("vi-VN") : "---"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">Khám khúc xạ & tư vấn thị lực</p>
                    <p className="text-sm text-slate-500 mt-0.5">Phụ trách: {pendingReview.tenBacSi || "Bác sĩ chuyên khoa"}</p>
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
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Đang gửi..." : <><Send className="w-4 h-4" /> Gửi đánh giá</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm text-center py-8">
              <CardContent>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Tất cả các lần khám đều đã được đánh giá!</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Cảm ơn bạn! Mọi phản hồi của bạn giúp chúng tôi nâng cao chất lượng dịch vụ của Vision Care.
                </p>
              </CardContent>
            </Card>
          )}

          {/* SECTION 2: LỊCH SỬ ĐÃ ĐÁNH GIÁ (Past Reviews) */}
          <div className="pt-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Đánh giá trước đây của bạn</h2>
            {pastReviews.length > 0 ? (
              <div className="space-y-4">
                {pastReviews.map((review: any) => (
                  <Card key={review.maDg} className="border-slate-200 shadow-sm">
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
                          <p className="text-sm font-semibold text-blue-600">Bác sĩ: {review.tenBacSi || "Bác sĩ chuyên khoa"}</p>
                          {review.maHoSo && (
                            <p className="text-xs text-slate-400 mt-0.5">Mã hồ sơ: {review.maHoSo}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                          <Calendar className="w-3.5 h-3.5" />
                          {review.ngayDg ? new Date(review.ngayDg).toLocaleDateString("vi-VN") : "---"}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                        <p className="text-slate-700 text-sm italic relative z-10">&quot;{review.noiDung || "Không có nhận xét chi tiết."}&quot;</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Bạn chưa viết đánh giá nào.</p>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}