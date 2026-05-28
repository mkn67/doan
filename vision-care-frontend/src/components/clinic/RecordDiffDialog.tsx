import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowRight, Eye, ShieldAlert, Sparkles } from "lucide-react";
import { HoSoKhamResponse, ChiTietThiLuc } from "@/types/clinic";

interface RecordDiffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recordOld: HoSoKhamResponse | null;
  recordNew: HoSoKhamResponse | null;
}

export default function RecordDiffDialog({ isOpen, onClose, recordOld, recordNew }: RecordDiffDialogProps) {
  if (!recordOld || !recordNew) return null;

  const getEyeDetails = (record: HoSoKhamResponse, type: "P" | "T"): ChiTietThiLuc => {
    return (
      record.danhSachThiLuc?.find((ct) => ct.loaiMat === type) || {
        loaiMat: type,
        sph: 0,
        cyl: 0,
        axis: 0,
        va: "10/10",
      }
    );
  };

  const odOld = getEyeDetails(recordOld, "P");
  const odNew = getEyeDetails(recordNew, "P");
  const osOld = getEyeDetails(recordOld, "T");
  const osNew = getEyeDetails(recordNew, "T");

  const renderDiffItem = (label: string, oldVal: string | number | undefined, newVal: string | number | undefined) => {
    const isChanged = oldVal !== newVal;
    return (
      <div className="grid grid-cols-3 py-3 border-b border-slate-100 items-center text-sm font-semibold">
        <span className="text-slate-500 font-medium">{label}</span>
        {isChanged ? (
          <>
            <span className="text-rose-500 line-through bg-rose-50/50 px-2 py-0.5 rounded text-center max-w-fit">
              {oldVal !== undefined ? oldVal : "---"}
            </span>
            <span className="text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded text-center max-w-fit flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5 inline text-emerald-500" />
              {newVal !== undefined ? newVal : "---"}
            </span>
          </>
        ) : (
          <span className="text-slate-800 col-span-2 pl-2">
            {newVal !== undefined ? newVal : "---"}
          </span>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-white rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            So Sánh Biến Động Thị Lực
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs mt-1">
            Đang so sánh bệnh án cũ ({recordOld.maHoSo} - {recordOld.ngayKham ? new Date(recordOld.ngayKham).toLocaleDateString("vi-VN") : "N/A"}) 
            với bệnh án mới ({recordNew.maHoSo} - {recordNew.ngayKham ? new Date(recordNew.ngayKham).toLocaleDateString("vi-VN") : "N/A"}).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* MẮT PHẢI (OD) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-extrabold text-blue-600 mb-3 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wider">
              <Eye className="w-4 h-4" /> Mắt Phải (OD)
            </h3>
            <div className="space-y-1">
              {renderDiffItem("Cận / Viễn (SPH)", odOld.sph, odNew.sph)}
              {renderDiffItem("Loạn thị (CYL)", odOld.cyl, odNew.cyl)}
              {renderDiffItem("Trục loạn (AXIS)", odOld.axis, odNew.axis)}
              {renderDiffItem("Thị lực (VA)", odOld.va, odNew.va)}
            </div>
          </div>

          {/* MẮT TRÁI (OS) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-extrabold text-indigo-600 mb-3 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wider">
              <Eye className="w-4 h-4" /> Mắt Trái (OS)
            </h3>
            <div className="space-y-1">
              {renderDiffItem("Cận / Viễn (SPH)", osOld.sph, osNew.sph)}
              {renderDiffItem("Loạn thị (CYL)", osOld.cyl, osNew.cyl)}
              {renderDiffItem("Trục loạn (AXIS)", osOld.axis, osNew.axis)}
              {renderDiffItem("Thị lực (VA)", osOld.va, osNew.va)}
            </div>
          </div>

          {/* CHUNG */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h3 className="font-extrabold text-slate-700 mb-3 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-slate-500" /> Chỉ số chung & Kết luận
            </h3>
            <div className="space-y-1">
              {renderDiffItem("Khoảng cách đồng tử (PD)", recordOld.danhSachThiLuc?.[0]?.pd, recordNew.danhSachThiLuc?.[0]?.pd)}
              {renderDiffItem("Kết luận", recordOld.ketLuan, recordNew.ketLuan)}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 border-t pt-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-sm"
          >
            Đóng
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
