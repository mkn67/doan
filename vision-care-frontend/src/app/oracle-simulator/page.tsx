"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Play,
  RotateCcw,
  HelpCircle,
  Lock,
  Unlock,
  Database,
  AlertTriangle,
  CheckCircle,
  Server,
  User,
  Terminal,
  ArrowRight,
  Settings,
  Code,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  ShieldAlert,
  Eye,
  ArrowLeft,
  Loader2,
  DatabaseZap,
  Activity,
  Cpu,
  RefreshCw,
  FileCode,
  BookOpen,
  UserCheck,
  Zap,
  Check,
  AlertCircle
} from "lucide-react";

// --- TYPES & INTERFACES ---
type ScenarioId = "phantom" | "lost_update" | "non_repeatable" | "deadlock";
type RunMode = "error" | "fixed";
type DbMode = "mock" | "live";
type ExplTab = "desc" | "code_err" | "code_fix" | "analysis";

interface LogEntry {
  session: 1 | 2 | "system";
  text: string;
  type: "info" | "success" | "warning" | "error" | "query" | "wait";
  timestamp: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function OracleSimulatorPage() {
  const [activeScenario, setActiveScenario] = useState<ScenarioId>("phantom");
  const [dbMode, setDbMode] = useState<DbMode>("mock");
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeExplTab, setActiveExplTab] = useState<ExplTab>("desc");
  const [systemPing, setSystemPing] = useState<number | null>(null);
  
  // States for Scenarios
  // 1. PHANTOM READ STATE
  const [phantomMode, setPhantomMode] = useState<RunMode>("error");
  const [phantomStep, setPhantomStep] = useState<number>(0);
  const [phantomLogs, setPhantomLogs] = useState<LogEntry[]>([]);
  const [phantomDb, setPhantomDb] = useState<{
    appointments: Array<{ malh: string; makh: string; mans: string; magoi: string; ngayhen: string; giohen: string; loai_lich: string; trangthai: string }>;
  }>({
    appointments: [
      { malh: "LH000001", makh: "KH102", mans: "NS001", magoi: "GOI001", ngayhen: "03-06-2026", giohen: "08:00:00", loai_lich: "Online", trangthai: "Mới" }
    ]
  });

  // 2. LOST UPDATE STATE
  const [lostUpdateMode, setLostUpdateMode] = useState<RunMode>("error");
  const [lostUpdateStep, setLostUpdateStep] = useState<number>(0);
  const [lostUpdateLogs, setLostUpdateLogs] = useState<LogEntry[]>([]);
  const [lostUpdateDb, setLostUpdateDb] = useState<{
    stock: number;
    sales: Array<{ mahd: string; malo: string; soluong: number; trangthai: string }>;
    s1Lock: boolean;
    s2Waiting: boolean;
  }>({
    stock: 100,
    sales: [],
    s1Lock: false,
    s2Waiting: false
  });

  // 3. NON-REPEATABLE READ STATE
  const [nonRepMode, setNonRepMode] = useState<RunMode>("error");
  const [nonRepStep, setNonRepStep] = useState<number>(0);
  const [nonRepLogs, setNonRepLogs] = useState<LogEntry[]>([]);
  const [nonRepDb, setNonRepDb] = useState<{
    invoiceTotal: number;
    invoiceStatus: string;
    s1Lock: boolean;
    s2Waiting: boolean;
    paymentMade: number | null;
    paymentsList: Array<{ matt: string; mahd: string; sotien: number; phuongthuc: string; trangthai: string }>;
  }>({
    invoiceTotal: 500000,
    invoiceStatus: "Chưa thanh toán",
    s1Lock: false,
    s2Waiting: false,
    paymentMade: null,
    paymentsList: []
  });

  // 4. DEADLOCK STATE
  const [deadlockMode, setDeadlockMode] = useState<RunMode>("error");
  const [deadlockStep, setDeadlockStep] = useState<number>(0);
  const [deadlockLogs, setDeadlockLogs] = useState<LogEntry[]>([]);
  const [deadlockDb, setDeadlockDb] = useState<{
    stock: number;
    invoiceTotal: number;
    invoiceStatus: string;
    locks: {
      L01: "S1" | "S2" | null;
      HD01: "S1" | "S2" | null;
    };
    waiting: {
      S1: "L01" | "HD01" | null;
      S2: "L01" | "HD01" | null;
    };
    s1Aborted: boolean;
  }>({
    stock: 100,
    invoiceTotal: 500000,
    invoiceStatus: "Chưa thanh toán",
    locks: { L01: null, HD01: null },
    waiting: { S1: null, S2: null },
    s1Aborted: false
  });

  // Ping backend database regularly when in live mode to show fancy latency stats
  useEffect(() => {
    if (dbMode === "live") {
      const interval = setInterval(async () => {
        const start = Date.now();
        try {
          await axios.get(`${API_BASE_URL}/api/concurrency/state`);
          setSystemPing(Date.now() - start);
        } catch {
          setSystemPing(null);
        }
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setSystemPing(null);
    }
  }, [dbMode]);

  // Helper to add logs with terminal styling
  const addLog = (
    scenario: ScenarioId,
    session: 1 | 2 | "system",
    text: string,
    type: LogEntry["type"] = "info"
  ) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newEntry: LogEntry = { session, text, type, timestamp: time };
    
    if (scenario === "phantom") setPhantomLogs(prev => [...prev, newEntry]);
    else if (scenario === "lost_update") setLostUpdateLogs(prev => [...prev, newEntry]);
    else if (scenario === "non_repeatable") setNonRepLogs(prev => [...prev, newEntry]);
    else if (scenario === "deadlock") setDeadlockLogs(prev => [...prev, newEntry]);
  };

  // --- API SERVICE INTERACTIONS (ORACLE LIVE CONNECTION) ---

  const executeLiveSql = async (session: number, sql: string, isBackground = false): Promise<any> => {
    if (!isBackground) {
      setApiLoading(true);
    }
    setApiError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/concurrency/execute`, {
        session: String(session),
        sql: sql
      });
      return response.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message;
      setApiError(errMsg);
      throw new Error(errMsg);
    } finally {
      if (!isBackground) {
        setApiLoading(false);
      }
    }
  };

  const fetchLiveState = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/concurrency/state`);
      const data = res.data;

      // Update Phantom state
      if (data.appointments) {
        setPhantomDb({
          appointments: data.appointments.map((ap: any) => ({
            malh: ap.malh,
            makh: ap.makh,
            mans: ap.mans,
            magoi: ap.magoi,
            ngayhen: ap.ngayhen,
            giohen: ap.gio_hen,
            loai_lich: ap.loai_lich,
            trangthai: ap.trangthai
          }))
        });
      }

      // Update Lost Update / Stock state
      if (data.stocks && data.stocks.length > 0) {
        setLostUpdateDb(prev => ({
          ...prev,
          stock: data.stocks[0].soluongton
        }));
      }

      // Update Non-repeatable state
      if (data.invoices && data.invoices.length > 0) {
        setNonRepDb(prev => ({
          ...prev,
          invoiceTotal: data.invoices[0].tongtien,
          invoiceStatus: data.invoices[0].trangthai,
          paymentsList: data.payments || []
        }));
      }

      // Update Deadlock state
      if (data.stocks && data.stocks.length > 0) {
        setDeadlockDb(prev => ({
          ...prev,
          stock: data.stocks[0].soluongton,
          invoiceTotal: data.invoices && data.invoices.length > 0 ? data.invoices[0].tongtien : prev.invoiceTotal,
          invoiceStatus: data.invoices && data.invoices.length > 0 ? data.invoices[0].trangthai : prev.invoiceStatus
        }));
      }

    } catch (err: any) {
      console.error("Failed to fetch live database state:", err);
    }
  };

  const resetLiveDb = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/concurrency/reset`);
      await fetchLiveState();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message;
      setApiError(errMsg);
      addLog(activeScenario, "system", `❌ Kết nối CSDL thất bại: ${errMsg}`, "error");
      setDbMode("mock");
      addLog(activeScenario, "system", "⚠️ Trực tiếp ngắt kết nối. Đã tự động chuyển về chế độ Giả lập Offline.", "warning");
    } finally {
      setApiLoading(false);
    }
  };

  // --- RESET & TOGGLE SCENARIOS ---

  const resetScenario = async (id: ScenarioId, forceMode?: DbMode) => {
    const currentMode = forceMode || dbMode;
    
    if (id === "phantom") {
      setPhantomStep(0);
      setPhantomLogs([]);
      setPhantomDb({
        appointments: [
          { malh: "LH000001", makh: "KH102", mans: "NS001", magoi: "GOI001", ngayhen: "03-06-2026", giohen: "08:00:00", loai_lich: "Online", trangthai: "Mới" }
        ]
      });
    } else if (id === "lost_update") {
      setLostUpdateStep(0);
      setLostUpdateLogs([]);
      setLostUpdateDb({
        stock: 100,
        sales: [],
        s1Lock: false,
        s2Waiting: false
      });
    } else if (id === "non_repeatable") {
      setNonRepStep(0);
      setNonRepLogs([]);
      setNonRepDb({
        invoiceTotal: 500000,
        invoiceStatus: "Chưa thanh toán",
        s1Lock: false,
        s2Waiting: false,
        paymentMade: null,
        paymentsList: []
      });
    } else if (id === "deadlock") {
      setDeadlockStep(0);
      setDeadlockLogs([]);
      setDeadlockDb({
        stock: 100,
        invoiceTotal: 500000,
        invoiceStatus: "Chưa thanh toán",
        locks: { L01: null, HD01: null },
        waiting: { S1: null, S2: null },
        s1Aborted: false
      });
    }

    if (currentMode === "live") {
      addLog(id, "system", "Đang dọn dẹp và reset lại dữ liệu trên CSDL Oracle thật...", "info");
      await resetLiveDb();
    } else {
      addLog(id, "system", "Khởi tạo môi trường giả lập Client (Mock Mode) thành công.", "success");
    }
  };

  // --- STEP ENGINES ---

  // 1. PHANTOM READ STEP BY STEP
  const nextPhantomStep = async () => {
    const next = phantomStep + 1;
    setPhantomStep(next);

    if (dbMode === "mock") {
      if (next === 1) {
        addLog("phantom", "system", "Session 1 (Lễ tân A) bắt đầu giao dịch...", "info");
        if (phantomMode === "fixed") {
          addLog("phantom", 1, "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;", "query");
        } else {
          addLog("phantom", 1, "-- Mức cô lập mặc định: READ COMMITTED", "info");
        }
        addLog("phantom", 1, "SELECT * FROM LICH_HEN WHERE NGAYHEN >= SYSDATE;", "query");
        addLog("phantom", 1, "Tìm thấy 1 lịch hẹn: LH000001 (Bác sĩ NS001 lúc 08:00)", "success");
      } 
      else if (next === 2) {
        addLog("phantom", "system", "Session 2 (Lễ tân B) chèn thêm lịch mới...", "info");
        addLog("phantom", 2, "BEGIN;", "query");
        addLog("phantom", 2, "INSERT INTO LICH_HEN (MALH, MAKH, MANS, MAGOI, NGAYHEN, GIO_HEN, LOAI_LICH, TRANGTHAI) VALUES ('LH000002', 'KH201', 'NS001', 'GOI001', TO_DATE('03-06-2026', 'DD-MM-YYYY'), TO_TIMESTAMP('03-06-2026 09:00:00', 'DD-MM-YYYY HH24:MI:SS'), N'Online', N'Mới');", "query");
        addLog("phantom", 2, "COMMIT;", "query");
        addLog("phantom", 2, "Giao dịch chèn lịch hẹn mới committed thành công.", "success");
        
        setPhantomDb(prev => ({
          appointments: [
            ...prev.appointments,
            { malh: "LH000002", makh: "KH201", mans: "NS001", magoi: "GOI001", ngayhen: "03-06-2026", giohen: "09:00:00", loai_lich: "Online", trangthai: "Mới" }
          ]
        }));
      } 
      else if (next === 3) {
        addLog("phantom", 1, "SELECT * FROM LICH_HEN WHERE NGAYHEN >= SYSDATE;", "query");
        if (phantomMode === "error") {
          addLog("phantom", 1, "Kết quả: Tìm thấy 2 lịch hẹn! (LH000001, LH000002)", "warning");
          addLog("phantom", 1, "💥 LỖI PHANTOM READ! Session 1 đọc thấy hàng mới chèn của Session 2 do mức cô lập Read Committed cho phép đọc dữ liệu đã commit.", "error");
        } else {
          addLog("phantom", 1, "Kết quả: Vẫn chỉ tìm thấy 1 lịch hẹn (LH000001).", "success");
          addLog("phantom", 1, "🛡️ AN TOÀN! Mức Serializable giữ snapshot tĩnh. Lịch mới LH000002 bị ẩn khỏi Session 1.", "success");
        }
      } 
      else if (next === 4) {
        addLog("phantom", 1, "COMMIT;", "query");
        addLog("phantom", 1, "Giao dịch Session 1 kết thúc. Giải phóng snapshot.", "info");
      }
    } else {
      try {
        if (next === 1) {
          addLog("phantom", "system", "Session 1 mở giao dịch đọc dữ liệu...", "info");
          if (phantomMode === "fixed") {
            addLog("phantom", 1, "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;", "query");
            await executeLiveSql(1, "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
          }
          addLog("phantom", 1, "SELECT * FROM LICH_HEN WHERE MALH IN ('LH000001', 'LH000002');", "query");
          const res = await executeLiveSql(1, "SELECT MALH, TRANGTHAI FROM LICH_HEN WHERE MALH IN ('LH000001', 'LH000002')");
          addLog("phantom", 1, `Oracle trả về: Tìm thấy ${res.data?.length || 0} dòng.`, "success");
        } 
        else if (next === 2) {
          addLog("phantom", "system", "Session 2 đặt lịch hẹn mới và Commit...", "info");
          addLog("phantom", 2, "INSERT INTO LICH_HEN (MALH, MAKH, MANS, MAGOI, NGAYHEN, GIO_HEN, LOAI_LICH, TRANGTHAI) VALUES ('LH000002', 'KH002', 'NS005', 'GK01', SYSDATE, SYSTIMESTAMP + INTERVAL '1' HOUR, 'Online', 'Mới');", "query");
          await executeLiveSql(2, "INSERT INTO LICH_HEN (MALH, MAKH, MANS, MAGOI, NGAYHEN, GIO_HEN, LOAI_LICH, TRANGTHAI) VALUES ('LH000002', 'KH002', 'NS005', 'GK01', SYSDATE, SYSTIMESTAMP + INTERVAL '1' HOUR, 'Online', 'Mới')");
          addLog("phantom", 2, "COMMIT;", "query");
          await executeLiveSql(2, "COMMIT");
          addLog("phantom", 2, "Oracle: Đã ghi nhận và Commit dòng mới.", "success");
          await fetchLiveState();
        } 
        else if (next === 3) {
          addLog("phantom", 1, "SELECT * FROM LICH_HEN WHERE MALH IN ('LH000001', 'LH000002');", "query");
          const res = await executeLiveSql(1, "SELECT MALH, TRANGTHAI FROM LICH_HEN WHERE MALH IN ('LH000001', 'LH000002')");
          const rowsCount = res.data?.length || 0;
          
          if (phantomMode === "error") {
            addLog("phantom", 1, `Oracle trả về: Tìm thấy ${rowsCount} dòng (Xuất hiện LH000002)!`, "warning");
            addLog("phantom", 1, "💥 LỖI PHANTOM READ THẬT! Oracle chạy Read Committed đã để lọt dòng mới chèn.", "error");
          } else {
            addLog("phantom", 1, `Oracle trả về: Tìm thấy ${rowsCount} dòng (Chỉ thấy LH000001).`, "success");
            addLog("phantom", 1, "🛡️ AN TOÀN! Mức SERIALIZABLE trên Oracle đã chặn đọc ảo thành công.", "success");
          }
        } 
        else if (next === 4) {
          addLog("phantom", 1, "COMMIT;", "query");
          await executeLiveSql(1, "COMMIT");
          addLog("phantom", 1, "Hoàn tất giao dịch Session 1.", "info");
        }
      } catch (err: any) {
        addLog("phantom", "system", `Lỗi thực thi Oracle: ${err.message}`, "error");
      }
    }
  };

  // 2. LOST UPDATE STEP BY STEP
  const nextLostUpdateStep = async () => {
    const next = lostUpdateStep + 1;
    setLostUpdateStep(next);

    if (dbMode === "mock") {
      if (next === 1) {
        addLog("lost_update", "system", "Session 1 (Nhân viên A) bắt đầu bán 10 sản phẩm (Tồn kho: 100)", "info");
        if (lostUpdateMode === "fixed") {
          addLog("lost_update", 1, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01' FOR UPDATE;", "query");
          addLog("lost_update", 1, "Tìm thấy tồn: 100. Đặt khóa Độc quyền (Row-Lock) trên dòng L01.", "success");
          setLostUpdateDb(prev => ({ ...prev, s1Lock: true }));
        } else {
          addLog("lost_update", 1, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01';", "query");
          addLog("lost_update", 1, "Tìm thấy tồn: 100. (Không khóa dòng, đọc bình thường)", "info");
        }
        addLog("lost_update", 1, "Kiểm tra: 100 >= 10 -> Thỏa mãn.", "success");
        addLog("lost_update", 1, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 10 WHERE MALO = 'L01';", "query");
        setLostUpdateDb(prev => ({
          ...prev,
          stock: 90,
          sales: [{ mahd: "HD001", malo: "L01", soluong: 10, trangthai: "Tạm tính (Uncommitted)" }]
        }));
      } 
      else if (next === 2) {
        addLog("lost_update", "system", "Session 2 (Nhân viên B) chốt bán song song 95 sản phẩm...", "info");
        if (lostUpdateMode === "fixed") {
          addLog("lost_update", 2, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01' FOR UPDATE WAIT 3;", "query");
          addLog("lost_update", 2, "⚠️ Dòng L01 đã bị S1 khóa. Session 2 rơi vào hàng chờ [WAITING]...", "wait");
          setLostUpdateDb(prev => ({ ...prev, s2Waiting: true }));
        } else {
          addLog("lost_update", 2, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01';", "query");
          addLog("lost_update", 2, "Do S1 chưa commit, S2 vẫn đọc được tồn kho cũ là 100!", "warning");
          addLog("lost_update", 2, "Kiểm tra: 100 >= 95 -> Thỏa mãn (Bị vượt rào kiểm tra!).", "warning");
          addLog("lost_update", 2, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 95 WHERE MALO = 'L01';", "query");
          addLog("lost_update", 2, "⚠️ Đụng độ khóa Update vật lý. Session 2 bị BLOCK [WAITING]...", "wait");
          setLostUpdateDb(prev => ({
            ...prev,
            s2Waiting: true,
            sales: [
              ...prev.sales,
              { mahd: "HD002", malo: "L01", soluong: 95, trangthai: "Đang chờ (Blocked)" }
            ]
          }));
        }
      } 
      else if (next === 3) {
        addLog("lost_update", "system", "Session 1 thực hiện COMMIT...", "info");
        addLog("lost_update", 1, "COMMIT;", "query");
        addLog("lost_update", 1, "Session 1 thành công. Giải phóng khóa L01.", "success");
        
        if (lostUpdateMode === "error") {
          addLog("lost_update", "system", "Khóa mở. Câu lệnh Update của S2 được thực thi.", "info");
          addLog("lost_update", 2, "S2 ghi đè dữ liệu: Tồn kho trở thành 90 - 95 = -5.", "info");
          setLostUpdateDb(prev => ({
            ...prev,
            stock: -5,
            s1Lock: false,
            s2Waiting: false,
            sales: [
              { mahd: "HD001", malo: "L01", soluong: 10, trangthai: "Đã thanh toán (Committed)" },
              { mahd: "HD002", malo: "L01", soluong: 95, trangthai: "Đã cập nhật (Chưa Commit)" }
            ]
          }));
        } else {
          addLog("lost_update", "system", "Khóa mở. S2 thức dậy thực hiện lệnh SELECT FOR UPDATE.", "info");
          addLog("lost_update", 2, "S2 đọc dữ liệu thực tế mới nhất: Tồn = 90.", "info");
          addLog("lost_update", 2, "Kiểm tra: 90 >= 95 -> THẤT BẠI! Lượng tồn không đủ.", "error");
          addLog("lost_update", 2, "RAISE_APPLICATION_ERROR(-20005, 'CTHD: Không đủ hàng trong kho!');", "error");
          addLog("lost_update", 2, "ROLLBACK;", "query");
          addLog("lost_update", 2, "🛡️ AN TOÀN! Giao dịch 2 bị hủy. Kho tránh được âm.", "success");
          setLostUpdateDb(prev => ({
            ...prev,
            stock: 90,
            s1Lock: false,
            s2Waiting: false,
            sales: [
              { mahd: "HD001", malo: "L01", soluong: 10, trangthai: "Đã thanh toán (Committed)" }
            ]
          }));
        }
      } 
      else if (next === 4) {
        if (lostUpdateMode === "error") {
          addLog("lost_update", 2, "COMMIT;", "query");
          addLog("lost_update", 2, "Session 2 commit thành công.", "success");
          addLog("lost_update", "system", "💥 KẾT QUẢ: Tồn kho âm -5! Lỗi Lost Update phá hỏng tính toàn vẹn dữ liệu.", "error");
          setLostUpdateDb(prev => ({
            ...prev,
            sales: prev.sales.map(s => ({ ...s, trangthai: "Đã thanh toán (Committed)" }))
          }));
        }
      }
    } else {
      try {
        if (next === 1) {
          addLog("lost_update", "system", "Session 1 bắt đầu giao dịch...", "info");
          if (lostUpdateMode === "fixed") {
            addLog("lost_update", 1, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01' FOR UPDATE;", "query");
            const res = await executeLiveSql(1, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01' FOR UPDATE");
            addLog("lost_update", 1, `Oracle: Đọc tồn = ${res.data[0].SOLUONGTON}. Đã khóa dòng.`, "success");
            setLostUpdateDb(prev => ({ ...prev, s1Lock: true }));
          } else {
            addLog("lost_update", 1, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01';", "query");
            const res = await executeLiveSql(1, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01'");
            addLog("lost_update", 1, `Oracle: Đọc tồn = ${res.data[0].SOLUONGTON}.`, "success");
          }

          addLog("lost_update", 1, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 10 WHERE MALO = 'L01';", "query");
          await executeLiveSql(1, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 10 WHERE MALO = 'L01'");
          addLog("lost_update", 1, "Oracle: Tạm thời cập nhật thành công.", "info");
          await fetchLiveState();
        } 
        else if (next === 2) {
          addLog("lost_update", "system", "Session 2 thực hiện mua 95 sản phẩm...", "info");
          
          if (lostUpdateMode === "fixed") {
            addLog("lost_update", 2, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01' FOR UPDATE WAIT 10;", "query");
            addLog("lost_update", 2, "⚠️ Dòng đang bị khóa. Session 2 bị BLOCK và treo kết nối...", "wait");
            setLostUpdateDb(prev => ({ ...prev, s2Waiting: true }));
            
            executeLiveSql(2, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01' FOR UPDATE WAIT 10", true)
              .then((res) => {
                addLog("lost_update", 2, `Session 2 thức dậy! Đọc được kho = ${res.data[0].SOLUONGTON}`, "success");
                addLog("lost_update", 2, "Kiểm tra: 90 < 95 -> Trả về lỗi không đủ hàng.", "error");
                executeLiveSql(2, "ROLLBACK");
                setLostUpdateDb(prev => ({ ...prev, s2Waiting: false }));
                fetchLiveState();
              })
              .catch((err) => {
                addLog("lost_update", 2, `❌ Lỗi: ${err.message}`, "error");
                setLostUpdateDb(prev => ({ ...prev, s2Waiting: false }));
              });
          } else {
            addLog("lost_update", 2, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01';", "query");
            const res = await executeLiveSql(2, "SELECT SOLUONGTON FROM LO_HANG WHERE MALO = 'L01'");
            addLog("lost_update", 2, `Session 2 đọc được kho cũ = ${res.data[0].SOLUONGTON}`, "warning");
            
            addLog("lost_update", 2, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 95 WHERE MALO = 'L01';", "query");
            addLog("lost_update", 2, "⚠️ Đụng độ khóa. Session 2 bị BLOCK và treo kết nối...", "wait");
            setLostUpdateDb(prev => ({ ...prev, s2Waiting: true }));
            
            executeLiveSql(2, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 95 WHERE MALO = 'L01'", true)
              .then(() => {
                addLog("lost_update", 2, "Session 2 thức dậy! Update thành công.", "success");
                setLostUpdateDb(prev => ({ ...prev, s2Waiting: false }));
                fetchLiveState();
              })
              .catch((err) => {
                addLog("lost_update", 2, `❌ Lỗi: ${err.message}`, "error");
                setLostUpdateDb(prev => ({ ...prev, s2Waiting: false }));
              });
          }
        } 
        else if (next === 3) {
          addLog("lost_update", "system", "Session 1 COMMIT...", "info");
          addLog("lost_update", 1, "COMMIT;", "query");
          await executeLiveSql(1, "COMMIT");
          addLog("lost_update", 1, "Session 1 thành công. Khóa được nhả.", "success");
          setLostUpdateDb(prev => ({ ...prev, s1Lock: false }));
          
          setTimeout(async () => {
            await fetchLiveState();
          }, 800);
        } 
        else if (next === 4) {
          if (lostUpdateMode === "error") {
            addLog("lost_update", 2, "COMMIT;", "query");
            await executeLiveSql(2, "COMMIT");
            addLog("lost_update", 2, "Session 2 committed.", "success");
            
            setTimeout(async () => {
              await fetchLiveState();
              addLog("lost_update", "system", "💥 KẾT QUẢ CSDL THẬT: Tồn kho bị âm -5 do Lost Update!", "error");
            }, 800);
          }
        }
      } catch (err: any) {
        addLog("lost_update", "system", `Lỗi thực thi Oracle: ${err.message}`, "error");
      }
    }
  };

  // 3. NON-REPEATABLE READ STEP BY STEP
  const nextNonRepStep = async () => {
    const next = nonRepStep + 1;
    setNonRepStep(next);

    if (dbMode === "mock") {
      if (next === 1) {
        addLog("non_repeatable", "system", "Session 1 (Thu ngân) mở hóa đơn HD01 để tính tiền...", "info");
        if (nonRepMode === "fixed") {
          addLog("non_repeatable", 1, "SELECT TONGTIEN FROM HOA_DON WHERE MAHD = 'HD01' FOR UPDATE;", "query");
          addLog("non_repeatable", 1, "Đọc ra 500,000đ. Giữ khóa độc quyền trên hóa đơn HD01.", "success");
          setNonRepDb(prev => ({ ...prev, s1Lock: true }));
        } else {
          addLog("non_repeatable", 1, "SELECT TONGTIEN FROM HOA_DON WHERE MAHD = 'HD01';", "query");
          addLog("non_repeatable", 1, "Đọc ra 500,000đ. (Không khóa dòng)", "info");
        }
      } 
      else if (next === 2) {
        addLog("non_repeatable", "system", "Session 2 (Bác sĩ/Nhan viên khác) nhảy vào sửa hóa đơn...", "info");
        addLog("non_repeatable", 2, "BEGIN;", "query");
        addLog("non_repeatable", 2, "UPDATE HOA_DON SET TONGTIEN = 350000 WHERE MAHD = 'HD01';", "query");
        
        if (nonRepMode === "fixed") {
          addLog("non_repeatable", 2, "⚠️ Dòng HD01 bị S1 khóa. Session 2 bị BLOCK [WAITING]...", "wait");
          setNonRepDb(prev => ({ ...prev, s2Waiting: true }));
        } else {
          addLog("non_repeatable", 2, "Cập nhật thành công.", "success");
          addLog("non_repeatable", 2, "COMMIT;", "query");
          addLog("non_repeatable", 2, "Giao dịch Session 2 committed. Tổng tiền HD01 chính thức thành 350,000đ.", "success");
          setNonRepDb(prev => ({ ...prev, invoiceTotal: 350000 }));
        }
      } 
      else if (next === 3) {
        addLog("non_repeatable", "system", "Session 1 tiến hành thanh toán hóa đơn...", "info");
        addLog("non_repeatable", 1, "SP_CHOT_THANH_TOAN_HOA_DON('HD01', ...);", "query");
        addLog("non_repeatable", 1, "Bên trong Proc: SELECT TONGTIEN FROM HOA_DON WHERE MAHD = 'HD01';", "query");
        
        if (nonRepMode === "error") {
          addLog("non_repeatable", 1, "-> Đọc lần 2 ra TONGTIEN = 350,000đ! (Bị thay đổi so với 500,000đ ban đầu)", "warning");
          addLog("non_repeatable", 1, "INSERT INTO THANH_TOAN (MATT, MAHD, MANS, NGAYTHANHTOAN, SOTIEN, PHUONGTHUC, TRANGTHAI) VALUES ('TT000001', 'HD01', 'NS001', SYSTIMESTAMP, 350000, N'Tiền mặt', N'Hoàn thành');", "query");
          addLog("non_repeatable", 1, "COMMIT;", "query");
          addLog("non_repeatable", 1, "Thanh toán hoàn tất. Hệ thống thu lệch 150k so với tiền thực tế khách trả.", "warning");
          addLog("non_repeatable", "system", "💥 LỖI NON-REPEATABLE READ! Tổng tiền thay đổi ngay trong cùng transaction.", "error");
          
          setNonRepDb(prev => ({
            ...prev,
            invoiceStatus: "Đã thanh toán",
            paymentMade: 350000,
            paymentsList: [{ matt: "TT000001", mahd: "HD01", sotien: 350000, phuongthuc: "Tiền mặt", trangthai: "Hoàn thành" }]
          }));
        } else {
          addLog("non_repeatable", 1, "-> Đọc lần 2 vẫn ra 500,000đ nhờ khóa bảo đảm.", "success");
          addLog("non_repeatable", 1, "INSERT INTO THANH_TOAN (MATT, MAHD, MANS, NGAYTHANHTOAN, SOTIEN, PHUONGTHUC, TRANGTHAI) VALUES ('TT000001', 'HD01', 'NS001', SYSTIMESTAMP, 500000, N'Tiền mặt', N'Hoàn thành');", "query");
          addLog("non_repeatable", 1, "COMMIT;", "query");
          addLog("non_repeatable", 1, "Session 1 thanh toán thành công 500,000đ.", "success");
          
          setNonRepDb(prev => ({
            ...prev,
            invoiceStatus: "Đã thanh toán",
            s1Lock: false,
            paymentMade: 500000,
            paymentsList: [{ matt: "TT000001", mahd: "HD01", sotien: 500000, phuongthuc: "Tiền mặt", trangthai: "Hoàn thành" }]
          }));
        }
      } 
      else if (next === 4) {
        if (nonRepMode === "fixed") {
          addLog("non_repeatable", "system", "Khóa giải phóng. S2 thức dậy chạy lệnh Update.", "info");
          addLog("non_repeatable", 2, "UPDATE HOA_DON SET TONGTIEN = 350000...", "query");
          addLog("non_repeatable", 2, "❌ Thất bại! Trigger TRG_VALIDATE_HOA_DON báo lỗi: Hóa đơn đã đóng!", "error");
          addLog("non_repeatable", 2, "ROLLBACK;", "query");
          addLog("non_repeatable", "system", "🛡️ AN TOÀN! Khóa bi quan đã bảo vệ hóa đơn không bị sửa đổi lúc đang chốt bill.", "success");
          setNonRepDb(prev => ({ ...prev, s2Waiting: false }));
        }
      }
    } else {
      try {
        if (next === 1) {
          addLog("non_repeatable", "system", "Session 1 đọc tiền hóa đơn HD01...", "info");
          if (nonRepMode === "fixed") {
            addLog("non_repeatable", 1, "SELECT TONGTIEN FROM HOA_DON WHERE MAHD = 'HD01' FOR UPDATE;", "query");
            const res = await executeLiveSql(1, "SELECT TONGTIEN FROM HOA_DON WHERE MAHD = 'HD01' FOR UPDATE");
            addLog("non_repeatable", 1, `Tổng tiền lần 1: ${res.data[0].TONGTIEN}đ. (Đã đặt khóa dòng)`, "success");
            setNonRepDb(prev => ({ ...prev, s1Lock: true }));
          } else {
            addLog("non_repeatable", 1, "SELECT TONGTIEN FROM HOA_DON WHERE MAHD = 'HD01';", "query");
            const res = await executeLiveSql(1, "SELECT TONGTIEN FROM HOA_DON WHERE MAHD = 'HD01'");
            addLog("non_repeatable", 1, `Tổng tiền lần 1: ${res.data[0].TONGTIEN}đ.`, "success");
          }
        } 
        else if (next === 2) {
          addLog("non_repeatable", "system", "Session 2 nhảy vào cố sửa tổng tiền hóa đơn thành 350,000đ...", "info");
          addLog("non_repeatable", 2, "UPDATE HOA_DON SET TONGTIEN = 350000 WHERE MAHD = 'HD01';", "query");
          
          if (nonRepMode === "fixed") {
            addLog("non_repeatable", 2, "⚠️ Dòng đang bị S1 khóa. Session 2 bị BLOCK (treo)...", "wait");
            setNonRepDb(prev => ({ ...prev, s2Waiting: true }));
            
            executeLiveSql(2, "UPDATE HOA_DON SET TONGTIEN = 350000 WHERE MAHD = 'HD01'", true)
              .then(() => {
                addLog("non_repeatable", 2, "Session 2 unblocked! Thực hiện COMMIT...", "query");
                executeLiveSql(2, "COMMIT");
                addLog("non_repeatable", 2, "Session 2 hoàn thành.", "success");
                setNonRepDb(prev => ({ ...prev, s2Waiting: false }));
                fetchLiveState();
              })
              .catch((err) => {
                addLog("non_repeatable", 2, `❌ Sửa thất bại (Do hóa đơn đã được S1 chốt thanh toán): ${err.message}`, "error");
                executeLiveSql(2, "ROLLBACK");
                setNonRepDb(prev => ({ ...prev, s2Waiting: false }));
                fetchLiveState();
              });
          } else {
            await executeLiveSql(2, "UPDATE HOA_DON SET TONGTIEN = 350000 WHERE MAHD = 'HD01'");
            addLog("non_repeatable", 2, "COMMIT;", "query");
            await executeLiveSql(2, "COMMIT");
            addLog("non_repeatable", 2, "Session 2 committed.", "success");
            await fetchLiveState();
          }
        } 
        else if (next === 3) {
          addLog("non_repeatable", "system", "Session 1 gọi chốt thanh toán...", "info");
          addLog("non_repeatable", 1, "SELECT TONGTIEN FROM HOA_DON WHERE MAHD = 'HD01';", "query");
          const res = await executeLiveSql(1, "SELECT TONGTIEN FROM HOA_DON WHERE MAHD = 'HD01'");
          const finalTotal = res.data[0].TONGTIEN;
          addLog("non_repeatable", 1, `Tổng tiền lần 2 đọc được: ${finalTotal}đ.`, "info");
          
          addLog("non_repeatable", 1, `INSERT INTO THANH_TOAN (MATT, MAHD, MANS, SOTIEN, PHUONGTHUC, TRANGTHAI) VALUES ('TT000001', 'HD01', 'NS010', ${finalTotal}, 'Tiền mặt', 'Hoàn thành');`, "query");
          await executeLiveSql(1, `INSERT INTO THANH_TOAN (MATT, MAHD, MANS, NGAYTHANHTOAN, SOTIEN, PHUONGTHUC, TRANGTHAI) VALUES ('TT000001', 'HD01', 'NS010', SYSTIMESTAMP, ${finalTotal}, N'Tiền mặt', N'Hoàn thành')`);
          
          addLog("non_repeatable", 1, "COMMIT;", "query");
          await executeLiveSql(1, "COMMIT");
          addLog("non_repeatable", 1, "Thanh toán thành công.", "success");
          setNonRepDb(prev => ({ ...prev, s1Lock: false }));
          
          if (nonRepMode === "error" && finalTotal === 350000) {
            addLog("non_repeatable", "system", "💥 LỖI NON-REPEATABLE READ THẬT XẢY RA! Số tiền hóa đơn bị đổi ngay lúc đang chốt tiền.", "error");
          }
          
          setTimeout(async () => {
            await fetchLiveState();
          }, 800);
        } 
        else if (next === 4) {
          if (nonRepMode === "fixed") {
            setTimeout(async () => {
              await fetchLiveState();
            }, 1000);
          }
        }
      } catch (err: any) {
        addLog("non_repeatable", "system", `Lỗi thực thi Oracle: ${err.message}`, "error");
      }
    }
  };

  // 4. DEADLOCK STEP BY STEP
  const nextDeadlockStep = async () => {
    const next = deadlockStep + 1;
    setDeadlockStep(next);

    if (dbMode === "mock") {
      if (next === 1) {
        addLog("deadlock", "system", "Session 1 (Thu ngân) thêm sản phẩm từ lô L01 vào HD01", "info");
        if (deadlockMode === "fixed") {
          addLog("deadlock", 1, "UPDATE HOA_DON SET TONGTIEN = TONGTIEN + 200000 WHERE MAHD = 'HD01';", "query");
          addLog("deadlock", 1, "-> Cập nhật hóa đơn thành công. Khóa dòng HD01 được cấp cho Session 1.", "success");
          setDeadlockDb(prev => ({ ...prev, locks: { ...prev.locks, HD01: "S1" } }));
        } else {
          addLog("deadlock", 1, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 2 WHERE MALO = 'L01';", "query");
          addLog("deadlock", 1, "-> Cập nhật lô hàng thành công. Khóa dòng L01 được cấp cho Session 1.", "success");
          setDeadlockDb(prev => ({ ...prev, locks: { ...prev.locks, L01: "S1" } }));
        }
      } 
      else if (next === 2) {
        addLog("deadlock", "system", "Session 2 (Quản lý) chốt Hủy hóa đơn HD01...", "info");
        addLog("deadlock", 2, "UPDATE HOA_DON SET TRANGTHAI = 'Đã hủy' WHERE MAHD = 'HD01';", "query");
        
        if (deadlockMode === "fixed") {
          addLog("deadlock", 2, "⚠️ Dòng HD01 đang bị S1 giữ khóa. Session 2 bị BLOCK [WAITING]...", "wait");
          setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S2: "HD01" } }));
        } else {
          addLog("deadlock", 2, "Hủy hóa đơn thành công. Khóa dòng HD01 được cấp cho Session 2.", "success");
          addLog("deadlock", 2, "Trigger TRG_HOA_DON_HUY chạy hoàn kho: UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + 2 WHERE MALO = 'L01';", "query");
          addLog("deadlock", 2, "⚠️ Dòng L01 đang bị S1 giữ khóa. Session 2 bị BLOCK [WAITING]...", "wait");
          
          setDeadlockDb(prev => ({
            ...prev,
            locks: { ...prev.locks, HD01: "S2" },
            waiting: { ...prev.waiting, S2: "L01" }
          }));
        }
      } 
      else if (next === 3) {
        addLog("deadlock", "system", "Session 1 tiếp tục thực hiện câu lệnh thứ hai...", "info");
        if (deadlockMode === "fixed") {
          addLog("deadlock", 1, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 2 WHERE MALO = 'L01';", "query");
          addLog("deadlock", 1, "Cập nhật lô hàng thành công. Khóa tiếp dòng L01.", "success");
          addLog("deadlock", 1, "COMMIT;", "query");
          addLog("deadlock", 1, "Session 1 hoàn thành, giải phóng toàn bộ khóa.", "success");
          
          setDeadlockDb(prev => ({
            ...prev,
            stock: 98,
            invoiceTotal: 700000,
            locks: { L01: null, HD01: null }
          }));
        } else {
          addLog("deadlock", 1, "UPDATE HOA_DON SET TONGTIEN = TONGTIEN + 200000 WHERE MAHD = 'HD01';", "query");
          addLog("deadlock", 1, "⚠️ Dòng HD01 đang bị S2 giữ khóa. Session 1 bị BLOCK [WAITING]...", "wait");
          setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S1: "HD01" } }));
        }
      } 
      else if (next === 4) {
        if (deadlockMode === "error") {
          addLog("deadlock", "system", "💥 PHÁT HIỆN DEADLOCK VÒNG LẶP! (S1 chờ S2 giữ HD01, S2 chờ S1 giữ L01)", "error");
          addLog("deadlock", "system", "Oracle phát hiện bế tắc và tự động hủy bỏ giao dịch của Session 1.", "error");
          addLog("deadlock", 1, "ORA-00060: deadlock detected while waiting for resource", "error");
          addLog("deadlock", 1, "AUTOMATIC ROLLBACK: Giao dịch Session 1 bị hủy và giải phóng tất cả khóa dòng.", "error");
          
          setDeadlockDb(prev => ({
            ...prev,
            locks: { ...prev.locks, L01: null },
            waiting: { ...prev.waiting, S1: null },
            s1Aborted: true
          }));
        } else {
          addLog("deadlock", "system", "S1 commit giải phóng khóa. Session 2 thức dậy hoàn tất công việc...", "info");
          addLog("deadlock", 2, "Session 2 được cấp khóa dòng HD01, chạy lệnh Update.", "success");
          addLog("deadlock", 2, "Trigger hoàn kho: UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + 2 WHERE MALO = 'L01';", "query");
          addLog("deadlock", 2, "COMMIT;", "query");
          addLog("deadlock", 2, "Session 2 hoàn thành giao dịch.", "success");
          setDeadlockDb(prev => ({
            ...prev,
            invoiceStatus: "Đã hủy",
            stock: 100,
            waiting: { ...prev.waiting, S2: null }
          }));
        }
      } 
      else if (next === 5) {
        if (deadlockMode === "error") {
          addLog("deadlock", "system", "Khóa L01 được nhả. Session 2 thức dậy và tiếp tục chạy lệnh.", "info");
          addLog("deadlock", 2, "Session 2 hoàn kho L01 thành công. Thực hiện COMMIT.", "success");
          addLog("deadlock", 2, "COMMIT;", "query");
          addLog("deadlock", 2, "Session 2 hoàn tất giao dịch hủy hóa đơn.", "success");
          setDeadlockDb(prev => ({
            ...prev,
            invoiceStatus: "Đã hủy",
            stock: 100,
            locks: { L01: null, HD01: null },
            waiting: { ...prev.waiting, S2: null }
          }));
        }
      }
    } else {
      try {
        if (next === 1) {
          addLog("deadlock", "system", "Session 1 bắt đầu giao dịch...", "info");
          if (deadlockMode === "fixed") {
            addLog("deadlock", 1, "UPDATE HOA_DON SET TONGTIEN = TONGTIEN + 200000 WHERE MAHD = 'HD01';", "query");
            await executeLiveSql(1, "UPDATE HOA_DON SET TONGTIEN = TONGTIEN + 200000 WHERE MAHD = 'HD01'");
            addLog("deadlock", 1, "Cập nhật hóa đơn thành công. (Giữ khóa HD01)", "success");
            setDeadlockDb(prev => ({ ...prev, locks: { ...prev.locks, HD01: "S1" } }));
          } else {
            addLog("deadlock", 1, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 2 WHERE MALO = 'L01';", "query");
            await executeLiveSql(1, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 2 WHERE MALO = 'L01'");
            addLog("deadlock", 1, "Cập nhật lô hàng thành công. (Giữ khóa L01)", "success");
            setDeadlockDb(prev => ({ ...prev, locks: { ...prev.locks, L01: "S1" } }));
          }
          await fetchLiveState();
        } 
        else if (next === 2) {
          addLog("deadlock", "system", "Session 2 (Hủy hóa đơn) bắt đầu...", "info");
          addLog("deadlock", 2, "UPDATE HOA_DON SET TRANGTHAI = 'Đã hủy' WHERE MAHD = 'HD01';", "query");
          
          if (deadlockMode === "fixed") {
            addLog("deadlock", 2, "⚠️ Dòng HD01 đã bị S1 khóa. Session 2 bị BLOCK (treo)...", "wait");
            setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S2: "HD01" } }));
            
            executeLiveSql(2, "UPDATE HOA_DON SET TRANGTHAI = N'Đã hủy' WHERE MAHD = 'HD01'", true)
              .then(() => {
                addLog("deadlock", 2, "Session 2 unblocked! Khóa được HD01. Chạy tiếp hoàn kho L01...", "success");
                return executeLiveSql(2, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + 2 WHERE MALO = 'L01'");
              })
              .then(() => {
                return executeLiveSql(2, "COMMIT");
              })
              .then(() => {
                addLog("deadlock", 2, "Session 2 hoàn thành giao dịch.", "success");
                setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S2: null } }));
                fetchLiveState();
              })
              .catch((err) => {
                addLog("deadlock", 2, `Session 2 thất bại: ${err.message}`, "error");
                executeLiveSql(2, "ROLLBACK");
                setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S2: null } }));
                fetchLiveState();
              });
          } else {
            await executeLiveSql(2, "UPDATE HOA_DON SET TRANGTHAI = N'Đã hủy' WHERE MAHD = 'HD01'");
            addLog("deadlock", 2, "Hủy HD01 thành công. (S2 giữ khóa HD01)", "success");
            setDeadlockDb(prev => ({ ...prev, locks: { ...prev.locks, HD01: "S2" } }));
            
            addLog("deadlock", 2, "Trigger TRG_HOA_DON_HUY chạy hoàn kho: UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + 2 WHERE MALO = 'L01';", "query");
            addLog("deadlock", 2, "⚠️ Dòng L01 đang bị khóa bởi S1. Session 2 bị BLOCK (treo)...", "wait");
            setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S2: "L01" } }));
            
            executeLiveSql(2, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + 2 WHERE MALO = 'L01'", true)
              .then(() => {
                addLog("deadlock", 2, "Session 2 unblocked! Chạy COMMIT...", "query");
                return executeLiveSql(2, "COMMIT");
              })
              .then(() => {
                addLog("deadlock", 2, "Session 2 committed.", "success");
                setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S2: null } }));
                fetchLiveState();
              })
              .catch((err) => {
                addLog("deadlock", 2, `Session 2 thất bại: ${err.message}`, "error");
                executeLiveSql(2, "ROLLBACK");
                setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S2: null } }));
                fetchLiveState();
              });
          }
          await fetchLiveState();
        } 
        else if (next === 3) {
          addLog("deadlock", "system", "Session 1 chạy câu lệnh thứ hai...", "info");
          
          if (deadlockMode === "fixed") {
            addLog("deadlock", 1, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 2 WHERE MALO = 'L01';", "query");
            await executeLiveSql(1, "UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - 2 WHERE MALO = 'L01'");
            addLog("deadlock", 1, "Cập nhật L01 thành công. Thực hiện COMMIT...", "success");
            addLog("deadlock", 1, "COMMIT;", "query");
            await executeLiveSql(1, "COMMIT");
            addLog("deadlock", 1, "Session 1 committed. Giải phóng toàn bộ khóa.", "success");
            setDeadlockDb(prev => ({ ...prev, locks: { HD01: null, L01: null } }));
            
            setTimeout(async () => {
              await fetchLiveState();
            }, 800);
          } else {
            addLog("deadlock", 1, "UPDATE HOA_DON SET TONGTIEN = TONGTIEN + 200000 WHERE MAHD = 'HD01';", "query");
            addLog("deadlock", 1, "⚠️ HD01 bị khóa bởi S2. Session 1 bị BLOCK (treo)...", "wait");
            setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S1: "HD01" } }));
            
            executeLiveSql(1, "UPDATE HOA_DON SET TONGTIEN = TONGTIEN + 200000 WHERE MAHD = 'HD01'", true)
              .then(() => {
                addLog("deadlock", 1, "Session 1 unblocked.", "success");
                setDeadlockDb(prev => ({ ...prev, waiting: { ...prev.waiting, S1: null } }));
              })
              .catch((err) => {
                addLog("deadlock", "system", "💥 PHÁT HIỆN DEADLOCK VÒNG LẶP TRÊN ORACLE DATABASE THẬT!", "error");
                addLog("deadlock", 1, `Oracle quăng lỗi ORA-00060: ${err.message}`, "error");
                addLog("deadlock", 1, "Hệ thống tự động hủy (Rollback) S1 để cứu bế tắc.", "error");
                setDeadlockDb(prev => ({
                  ...prev,
                  locks: { ...prev.locks, L01: null },
                  waiting: { ...prev.waiting, S1: null },
                  s1Aborted: true
                }));
                fetchLiveState();
              });
          }
          await fetchLiveState();
        } 
        else if (next === 4) {
          setTimeout(async () => {
            await fetchLiveState();
          }, 800);
        }
      } catch (err: any) {
        addLog("deadlock", "system", `Lỗi thực thi Oracle: ${err.message}`, "error");
      }
    }
  };

  // --- UI MAP TRANSLATORS ---
  function getCurrentStepNum(id: ScenarioId): number {
    if (id === "phantom") return phantomStep;
    if (id === "lost_update") return lostUpdateStep;
    if (id === "non_repeatable") return nonRepStep;
    return deadlockStep;
  }

  function isMaxStepReached(id: ScenarioId): boolean {
    const step = getCurrentStepNum(id);
    if (id === "phantom") return step >= 4;
    if (id === "lost_update") return lostUpdateMode === "error" ? step >= 4 : step >= 3;
    if (id === "non_repeatable") return step >= 4;
    return deadlockMode === "error" ? step >= 5 : step >= 4;
  }

  function handleNextStep() {
    if (activeScenario === "phantom") nextPhantomStep();
    else if (activeScenario === "lost_update") nextLostUpdateStep();
    else if (activeScenario === "non_repeatable") nextNonRepStep();
    else if (activeScenario === "deadlock") nextDeadlockStep();
  }

  function getLogs(id: ScenarioId): LogEntry[] {
    if (id === "phantom") return phantomLogs;
    if (id === "lost_update") return lostUpdateLogs;
    if (id === "non_repeatable") return nonRepLogs;
    return deadlockLogs;
  }

  function getLogClass(type: LogEntry["type"]) {
    switch (type) {
      case "error": return "text-rose-400 font-bold";
      case "warning": return "text-amber-400";
      case "success": return "text-emerald-400";
      case "wait": return "text-indigo-400 italic animate-pulse";
      case "query": return "text-cyan-400 bg-slate-900/90 py-1 px-2 rounded-md border border-slate-800 block my-1 font-mono";
      default: return "text-slate-300";
    }
  }

  function getStepsTimeline(id: ScenarioId): string[] {
    if (id === "phantom") {
      return [
        "S1: Đọc ban đầu",
        "S2: Chèn & Commit",
        "S1: Đọc lại đối chiếu",
        "S1: Commit kết thúc"
      ];
    }
    if (id === "lost_update") {
      return lostUpdateMode === "error" 
        ? [
            "S1: Bán 10 (Chờ)",
            "S2: Bán 95 (Blocked)",
            "S1: Commit -> S2 trừ",
            "S2: Commit -> Kho âm"
          ]
        : [
            "S1: Đọc FOR UPDATE",
            "S2: FOR UPDATE (Wait)",
            "S1: Commit -> S2 Abort"
          ];
    }
    if (id === "non_repeatable") {
      return [
        "S1: Đọc (500k)",
        "S2: Sửa & Commit (350k)",
        "S1: Chốt bill (Đọc 2)",
        "Giao dịch 2 unblock"
      ];
    }
    return deadlockMode === "error"
      ? [
          "S1: Update Lô L01",
          "S2: Update Bill HD01",
          "S2: Update Lô L01 (Chờ)",
          "S1: Update Bill HD01 -> 💥",
          "S2: Commit hoàn tất"
        ]
      : [
          "S1: Update Bill HD01",
          "S2: Hủy Bill HD01 (Chờ)",
          "S1: Update Lô & Commit",
          "S2: Thức dậy hoàn tất"
        ];
  }

  // --- ACADEMIC EXPLANATIONS ---

  function getAcademicExplanation(id: ScenarioId) {
    const tabs: Array<{ id: ExplTab; label: string; icon: any }> = [
      { id: "desc", label: "Mô tả", icon: BookOpen },
      { id: "code_err", label: "Mã lỗi PL/SQL", icon: FileCode },
      { id: "code_fix", label: "Mã sửa", icon: Code },
      { id: "analysis", label: "Phân tích", icon: Info }
    ];

    return (
      <div className="space-y-4">
        {/* Tab selector */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveExplTab(t.id)}
                className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all ${
                  activeExplTab === t.id
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
          {activeExplTab === "desc" && (
            <div className="space-y-2">
              {id === "phantom" && (
                <>
                  <p className="font-bold text-slate-200 text-xs">Lỗi Đọc Ảo (Phantom Read)</p>
                  <p>Khi 1 lễ tân vào xem danh sách các lịch hẹn. Cùng lúc đó, 1 lễ tân khác tiến hành chèn thêm 1 lịch hẹn mới (INSERT) và COMMIT. Lần thứ hai lễ tân 1 xem lại danh sách thì thấy dữ liệu xuất hiện thêm một dòng "ảo" từ trên trời rơi xuống.</p>
                  <div className="bg-rose-950/20 border border-rose-900/60 p-2.5 rounded-xl text-rose-400 mt-2">
                    <b>Bất thường:</b> Danh sách lịch hẹn bị thay đổi số lượng dòng ngay trong cùng một phiên giao dịch đang mở.
                  </div>
                </>
              )}
              {id === "lost_update" && (
                <>
                  <p className="font-bold text-slate-200 text-xs">Mất Dữ Liệu Cập Nhật (Lost Update)</p>
                  <p>Khi hai nhân viên cùng bán sản phẩm từ Lô Hàng L01 đồng thời. Do câu lệnh SELECT kiểm tra tồn kho trong Trigger không khóa dòng, cả 2 session đều đọc được tồn kho là 100 và cho phép bán. Giao dịch của nhân viên A commit trước làm giảm kho còn 90, sau đó nhân viên B ghi đè (commit) làm giảm kho tiếp dựa trên số lượng cũ, dẫn đến tồn kho bị tính sai nghiêm trọng hoặc bị âm.</p>
                  <div className="bg-rose-950/20 border border-rose-900/60 p-2.5 rounded-xl text-rose-400 mt-2">
                    <b>Bất thường:</b> Thay đổi của Session 1 bị ghi đè hoàn toàn bởi Session 2, làm mất dữ liệu cập nhật hợp lệ.
                  </div>
                </>
              )}
              {id === "non_repeatable" && (
                <>
                  <p className="font-bold text-slate-200 text-xs">Không Lặp Lại Đọc (Non-repeatable Read)</p>
                  <p>Thu ngân mở hóa đơn HD01 để xem số tiền cần thanh toán (500k). Cùng lúc đó, bác sĩ cập nhật lại dịch vụ và giảm giá trên hóa đơn HD01 thành 350k và COMMIT. Khi thủ tục chốt bill của thu ngân chạy lại lệnh SELECT thì giá trị đã thay đổi thành 350k, gây lệch sổ sách.</p>
                  <div className="bg-rose-950/20 border border-rose-900/60 p-2.5 rounded-xl text-rose-400 mt-2">
                    <b>Bất thường:</b> Đọc cùng một dòng dữ liệu hai lần trong cùng một giao dịch nhưng nhận được hai giá trị khác nhau.
                  </div>
                </>
              )}
              {id === "deadlock" && (
                <>
                  <p className="font-bold text-slate-200 text-xs">Bế Tắc (Deadlock)</p>
                  <p>Xảy ra khi hai giao dịch chờ đợi lẫn nhau giải phóng khóa. Session 1 cập nhật Lô hàng L01 (giữ khóa L01) và chuẩn bị cập nhật Hóa đơn HD01. Session 2 cập nhật Hóa đơn HD01 (giữ khóa HD01) và chuẩn bị cập nhật Lô hàng L01. Hai bên bị treo vô tận cho đến khi Oracle phát hiện deadlock và Rollback một bên.</p>
                  <div className="bg-rose-950/20 border border-rose-900/60 p-2.5 rounded-xl text-rose-400 mt-2">
                    <b>Bất thường:</b> Cả hai giao dịch đều bị treo cứng do tranh chấp tài nguyên chéo, buộc hệ quản trị CSDL phải hủy bỏ một giao dịch.
                  </div>
                </>
              )}
            </div>
          )}

          {activeExplTab === "code_err" && (
            <div className="space-y-2">
              <p className="text-slate-400 italic">Mã lệnh gây lỗi trong cơ sở dữ liệu:</p>
              <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 overflow-x-auto text-[10px] font-mono text-rose-300">
                {id === "phantom" && (
`-- Mức cô lập mặc định Read Committed
SELECT * FROM LICH_HEN 
WHERE TRUNC(NGAYHEN) >= TRUNC(SYSDATE);`)}
                {id === "lost_update" && (
`-- Lệnh SELECT thông thường trong Trigger
SELECT SOLUONGTON, NGAYHETHAN 
INTO v_ton, v_hsd 
FROM LO_HANG 
WHERE MALO = :NEW.MALO;`)}
                {id === "non_repeatable" && (
`-- SELECT thường trong thủ tục chốt bill
SELECT TONGTIEN INTO v_tongtien 
FROM HOA_DON WHERE MAHD = p_mahd;`)}
                {id === "deadlock" && (
`-- Thứ tự khóa chéo nhau:
-- Trigger 1 (CTHD): LO_HANG -> HOA_DON
UPDATE LO_HANG ... WHERE MALO = :NEW.MALO;
UPDATE HOA_DON ... WHERE MAHD = :NEW.MAHD;

-- Trigger 2 (HỦY): HOA_DON -> LO_HANG
-- UPDATE HOA_DON bên ngoài giữ khóa HOA_DON
-- Vào trigger chạy cập nhật LO_HANG:
UPDATE LO_HANG ... WHERE MALO = rec.MALO;`)}
              </pre>
            </div>
          )}

          {activeExplTab === "code_fix" && (
            <div className="space-y-2">
              <p className="text-slate-400 italic">Giải pháp khắc phục an toàn:</p>
              <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 overflow-x-auto text-[10px] font-mono text-emerald-400">
                {id === "phantom" && (
`-- Áp dụng mức cô lập tuần tự hóa
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT * FROM LICH_HEN WHERE ...;`)}
                {id === "lost_update" && (
`-- Khóa bi quan dòng Lo Hang ngay khi đọc
SELECT SOLUONGTON, NGAYHETHAN 
INTO v_ton, v_hsd 
FROM LO_HANG 
WHERE MALO = :NEW.MALO 
FOR UPDATE; -- Khóa dòng lập tức`)}
                {id === "non_repeatable" && (
`-- Khóa hóa đơn lúc thu ngân chuẩn bị chốt tiền
SELECT TONGTIEN FROM HOA_DON 
WHERE MAHD = 'HD01' 
FOR UPDATE WAIT 3; -- Đợi khóa 3s`)}
                {id === "deadlock" && (
`-- Đảo ngược thứ tự cập nhật trong Trigger CTHD
-- Khóa HOA_DON trước để đồng bộ thứ tự khóa
UPDATE HOA_DON SET TONGTIEN = ... WHERE MAHD = :NEW.MAHD;
-- Khóa LO_HANG sau
UPDATE LO_HANG SET SOLUONGTON = ... WHERE MALO = :NEW.MALO;`)}
              </pre>
            </div>
          )}

          {activeExplTab === "analysis" && (
            <div className="space-y-2">
              <p className="font-bold text-slate-200">Phân tích Giải pháp</p>
              {id === "phantom" && (
                <p>Mức cô lập <b>SERIALIZABLE</b> của Oracle hoạt động bằng cơ chế Snapshot Isolation. Khi bắt đầu giao dịch, Oracle cấp một "bản sao tĩnh" của dữ liệu. Mọi thay đổi commit của các session khác sau thời điểm đó sẽ bị ẩn đi, giúp Session 1 hoàn toàn không bị ảnh hưởng bởi Phantom Read.</p>
              )}
              {id === "lost_update" && (
                <p>Mệnh đề <b>FOR UPDATE</b> thực thi cơ chế Khóa bi quan (Pessimistic Locking). Khi S1 thực hiện SELECT FOR UPDATE, Oracle cấp khóa độc quyền dòng L01. S2 vào sau chạy SELECT FOR UPDATE sẽ bị chặn đứng ngay lập tức và phải xếp hàng chờ S1 chốt giao dịch, từ đó đọc được lượng tồn kho thực tế chính xác nhất.</p>
              )}
              {id === "non_repeatable" && (
                <p>Bằng cách khóa hóa đơn bằng <b>FOR UPDATE WAIT n</b> ngay khi thu ngân click mở màn hình tính tiền, hệ thống sẽ ngăn chặn bất kỳ nhân viên nào khác sửa đổi thông số của hóa đơn này. Việc chỉ định thời gian chờ <code>WAIT 3</code> giúp hệ thống tự hủy yêu cầu và báo lỗi nếu khóa bị chiếm giữ quá lâu, tránh treo UX.</p>
              )}
              {id === "deadlock" && (
                <p>Nguyên tắc vàng để triệt tiêu Deadlock là <b>Đồng bộ hóa thứ tự khóa tài nguyên (Lock Ordering)</b>. Khi cả hai kịch bản thêm chi tiết hóa đơn và hủy hóa đơn đều tuân thủ thứ tự khóa là: <code>HOA_DON &rarr; LO_HANG</code>, thì S2 khi cố hủy hóa đơn sẽ bị chặn ngay ở dòng HOA_DON mà không kịp khóa LO_HANG, giúp loại bỏ hoàn toàn khả năng bế tắc vòng tròn.</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DB VISUALISATIONS (DATAGRIP-LIKE SLEEK GRID VIEWS) ---

  function renderPhantomDB() {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" /> Bảng: LICH_HEN
            </span>
            <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">
              Rows: {phantomDb.appointments.length}
            </span>
          </div>
          
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
            <table className="w-full text-left text-[10px] border-collapse font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-sans text-slate-400">
                  <th className="p-2.5 border-r border-slate-900">MALH</th>
                  <th className="p-2.5 border-r border-slate-900">MAKH</th>
                  <th className="p-2.5 border-r border-slate-900">MANS</th>
                  <th className="p-2.5 border-r border-slate-900">MAGOI</th>
                  <th className="p-2.5 border-r border-slate-900">NGAYHEN</th>
                  <th className="p-2.5 border-r border-slate-900">GIO_HEN</th>
                  <th className="p-2.5 border-r border-slate-900">LOAI_LICH</th>
                  <th className="p-2.5">TRANGTHAI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {phantomDb.appointments.map((ap, i) => (
                  <tr key={ap.malh} className={`hover:bg-slate-900/50 transition-colors ${i === 1 ? "animate-pulse bg-blue-950/30 text-blue-300 font-bold" : ""}`}>
                    <td className="p-2.5 border-r border-slate-900 font-bold text-slate-200">{ap.malh}</td>
                    <td className="p-2.5 border-r border-slate-900">{ap.makh}</td>
                    <td className="p-2.5 border-r border-slate-900 text-slate-400">{ap.mans}</td>
                    <td className="p-2.5 border-r border-slate-900 text-slate-400">{ap.magoi}</td>
                    <td className="p-2.5 border-r border-slate-900 truncate max-w-[80px]">{ap.ngayhen}</td>
                    <td className="p-2.5 border-r border-slate-900 text-slate-300">{ap.giohen}</td>
                    <td className="p-2.5 border-r border-slate-900 font-sans text-[9px]">{ap.loai_lich}</td>
                    <td className="p-2.5">
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-sans font-black uppercase bg-blue-950/80 text-blue-400 border border-blue-900/50">
                        {ap.trangthai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual view comparisons */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Trình trạng Xem của Lễ tân
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-[10px]">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="font-bold text-blue-400 uppercase tracking-wider mb-1.5">Lễ tân A (Session 1)</p>
              <div className="font-mono text-slate-400 space-y-1">
                {phantomStep === 0 && <p className="italic text-slate-500">Chưa bắt đầu truy vấn</p>}
                {phantomStep >= 1 && (
                  <>
                    <p>✓ Query: Tìm thấy 1 dòng</p>
                    <p className="text-[9px] text-slate-500">→ LH000001 (08:00)</p>
                  </>
                )}
                {phantomStep === 3 && phantomMode === "error" && (
                  <p className="text-rose-400 font-bold animate-pulse">⚠️ Thấy 2 dòng! (LH000002 xuất hiện ảo)</p>
                )}
                {phantomStep === 3 && phantomMode === "fixed" && (
                  <p className="text-emerald-400 font-bold">✓ Vẫn thấy 1 dòng! (Chặn đọc ảo)</p>
                )}
                {phantomStep >= 4 && (
                  <p className="text-slate-300">✓ Thấy 2 dòng (Sau khi commit S1)</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <p className="font-bold text-purple-400 uppercase tracking-wider mb-1.5">Lễ tân B (Session 2)</p>
              <div className="font-mono text-slate-400 space-y-1">
                {phantomStep < 2 ? (
                  <p className="italic text-slate-500">Chưa thực hiện thao tác</p>
                ) : (
                  <p className="text-emerald-400 font-bold">✓ Đã đặt lịch LH000002 thành công và COMMIT</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderLostUpdateDB() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Stock Display */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center relative overflow-hidden flex flex-col justify-between">
            {lostUpdateDb.s1Lock && (
              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-rose-950/80 text-rose-450 border border-rose-900/50 text-[8px] font-black uppercase rounded flex items-center gap-0.5 animate-pulse">
                <Lock className="w-2.5 h-2.5" /> Lock (S1)
              </div>
            )}
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">TỒN KHO LÔ L01</span>
              <p className="text-[10px] text-slate-500 font-mono">Batch: L01 (Kính áp tròng)</p>
            </div>
            <p className={`text-5xl font-black font-mono my-3 ${lostUpdateDb.stock < 0 ? "text-rose-500" : "text-emerald-400"}`}>
              {lostUpdateDb.stock}
            </p>
            <span className="text-[10px] text-slate-400 font-bold">sản phẩm tồn vật lý</span>
          </div>

          {/* Active Locks Graph */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">QUẢN LÝ KHÓA (LOCKS)</span>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold">Khóa dòng L01:</span>
                {lostUpdateDb.s1Lock ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> EXCLUSIVE (S1)</span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1"><Unlock className="w-3.5 h-3.5" /> FREE</span>
                )}
              </div>
              <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-500 font-bold">S2 Bị Block:</span>
                {lostUpdateDb.s2Waiting ? (
                  <span className="text-amber-400 animate-pulse font-bold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> WAITING
                  </span>
                ) : (
                  <span className="text-slate-500 font-bold">KHÔNG</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" /> Bảng: CT_HOA_DON (Bán sản phẩm)
          </span>
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <table className="w-full text-left text-[10px] border-collapse font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-2.5">MÃ GIAO DỊCH</th>
                  <th className="p-2.5">MÃ LÔ</th>
                  <th className="p-2.5">SỐ LƯỢNG MUA</th>
                  <th className="p-2.5">TRẠNG THÁI GIAO DỊCH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {lostUpdateDb.sales.length === 0 && dbMode === "mock" ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-600 italic">Chưa phát sinh giao dịch nào</td>
                  </tr>
                ) : dbMode === "live" ? (
                  <>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-blue-400">HD001 (Nhân viên A)</td>
                      <td className="p-2.5">L01</td>
                      <td className="p-2.5 text-slate-200">10</td>
                      <td className="p-2.5">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase ${lostUpdateStep >= 3 ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-blue-950 text-blue-400 border border-blue-900/50"}`}>
                          {lostUpdateStep >= 3 ? "Đã thanh toán (Committed)" : lostUpdateStep >= 1 ? "Tạm tính (Uncommitted)" : "Chưa tạo"}
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-purple-400">HD002 (Nhân viên B)</td>
                      <td className="p-2.5">L01</td>
                      <td className="p-2.5 text-slate-200">95</td>
                      <td className="p-2.5">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase ${
                          lostUpdateStep >= 4 && lostUpdateMode === "error"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50"
                            : lostUpdateStep >= 3 && lostUpdateMode === "fixed"
                            ? "bg-rose-950 text-rose-450 border border-rose-900/50"
                            : lostUpdateStep >= 2 && lostUpdateDb.s2Waiting
                            ? "bg-amber-950 text-amber-400 border border-amber-900/50 animate-pulse"
                            : "bg-blue-950 text-blue-400 border border-blue-900/50"
                        }`}>
                          {lostUpdateStep >= 4 && lostUpdateMode === "error"
                            ? "Đã thanh toán (Committed)"
                            : lostUpdateStep >= 3 && lostUpdateMode === "fixed"
                            ? "Bị hủy (Aborted / Rolled back)"
                            : lostUpdateStep >= 2
                            ? "Đang chờ khóa (Blocked)"
                            : "Chưa tạo"}
                        </span>
                      </td>
                    </tr>
                  </>
                ) : (
                  lostUpdateDb.sales.map((sale) => (
                    <tr key={sale.mahd} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-blue-400">{sale.mahd} (Nhân viên {sale.mahd === "HD001" ? "A" : "B"})</td>
                      <td className="p-2.5">{sale.malo}</td>
                      <td className="p-2.5 text-slate-200">{sale.soluong}</td>
                      <td className="p-2.5">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase ${
                          sale.trangthai.includes("thanh toán") 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" 
                            : sale.trangthai.includes("chờ")
                            ? "bg-amber-950 text-amber-400 border border-amber-900/50 animate-pulse"
                            : "bg-blue-950 text-blue-400 border border-blue-900/50"
                        }`}>
                          {sale.trangthai}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function renderNonRepDB() {
    return (
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" /> Bảng: HOA_DON (Gốc hóa đơn HD01)
          </span>
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
            <table className="w-full text-left text-[10px] border-collapse font-mono">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-2.5">MAHD</th>
                  <th className="p-2.5">TỔNG TIỀN BAN ĐẦU</th>
                  <th className="p-2.5">TỔNG TIỀN TRONG DB THỜI ĐIỂM NÀY</th>
                  <th className="p-2.5">TRẠNG THÁI HÓA ĐƠN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-2.5 font-bold text-slate-200">HD01</td>
                  <td className="p-2.5 text-slate-500">500,000đ</td>
                  <td className="p-2.5 font-bold text-slate-200">
                    {nonRepDb.invoiceTotal.toLocaleString()}đ
                  </td>
                  <td className="p-2.5">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-sans font-bold uppercase ${
                      nonRepDb.invoiceStatus === "Đã thanh toán" 
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" 
                        : "bg-amber-950 text-amber-400 border border-amber-900/50"
                    }`}>
                      {nonRepDb.invoiceStatus}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Lock Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-bold text-[10px]">
            <p className="text-slate-400 mb-1.5 uppercase tracking-wider text-[9px]">KHÓA DÒNG HOA ĐƠN:</p>
            {nonRepDb.s1Lock ? (
              <span className="text-rose-400 flex items-center gap-1.5"><Lock className="w-4 h-4" /> EXCLUSIVE LOCK (S1)</span>
            ) : (
              <span className="text-slate-600 flex items-center gap-1.5"><Unlock className="w-4 h-4" /> NO ACTIVE LOCKS</span>
            )}
          </div>
          
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-bold text-[10px] flex flex-col justify-between">
            <p className="text-slate-400 mb-1.5 uppercase tracking-wider text-[9px]">KẾT QUẢ GIAO DỊCH QUYẾT TOÁN:</p>
            {nonRepDb.paymentsList && nonRepDb.paymentsList.length > 0 ? (
              <div className="space-y-1">
                {nonRepDb.paymentsList.map(pay => (
                  <span key={pay.matt} className="flex items-center gap-1 text-[11px] font-black text-emerald-400 font-mono">
                    {pay.matt}: {pay.sotien?.toLocaleString()}đ ({pay.trangthai})
                  </span>
                ))}
              </div>
            ) : nonRepDb.paymentMade !== null ? (
              <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400 font-mono">
                TT000001: {nonRepDb.paymentMade.toLocaleString()}đ (Hoàn thành)
              </span>
            ) : (
              <span className="text-slate-500 italic">Chưa gọi procedure</span>
            )}
          </div>
        </div>

        {/* Comparison Alert */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
          <p className="font-bold text-slate-400 text-[10px] uppercase mb-1.5 tracking-wider">So sánh chênh lệch thực tế:</p>
          {nonRepStep >= 3 && nonRepMode === "error" && (
            <div className="bg-rose-950/20 border border-rose-900/60 p-2.5 rounded-xl text-rose-450 text-[11px] flex gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <p>
                <b>LỆCH PHA SỐ TIỀN!</b> Thu ngân thu 500k của khách nhưng CSDL chỉ lưu thanh toán 350k. Thất thoát 150.000đ do dữ liệu bị cập nhật chồng chéo.
              </p>
            </div>
          )}
          {nonRepStep >= 3 && nonRepMode === "fixed" && (
            <div className="bg-emerald-950/20 border border-emerald-900/60 p-2.5 rounded-xl text-emerald-450 text-[11px] flex gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p>
                <b>NHẤT QUÁN!</b> Quyết toán thành công đúng 500,000đ. Giao dịch sửa hóa đơn lúc đang thanh toán của S2 đã bị chặn đứng an toàn.
              </p>
            </div>
          )}
          {nonRepStep < 3 && <p className="text-slate-600 italic">Bấm "Bước tiếp theo" để tiến hành chốt bill...</p>}
        </div>
      </div>
    );
  }

  function renderDeadlockDB() {
    return (
      <div className="space-y-4 font-mono text-[10px]">
        {/* Animated Lock Graph */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">
            Sơ đồ Tranh chấp Khóa và Chờ đợi (Lock Graph)
          </span>
          
          <div className="flex justify-around items-center py-4 bg-slate-900/50 rounded-xl border border-slate-800 relative">
            {/* Session 1 */}
            <div className="flex flex-col items-center">
              <div className={`p-3 rounded-xl border text-center ${deadlockDb.s1Aborted ? "bg-rose-950/40 border-rose-800 text-rose-400 animate-pulse" : "bg-blue-950 border-blue-800 text-blue-400"}`}>
                <User className="w-5 h-5 mx-auto mb-1" />
                <p className="text-[9px] font-black">SESSION 1</p>
                <p className="text-[8px] text-slate-500">(Thu ngân)</p>
              </div>
              <div className="mt-2 space-y-0.5 text-slate-500 text-[8px]">
                <p>Giữ: {deadlockStep >= 1 ? (deadlockMode === "error" ? "L01" : "HD01") : "không"}</p>
                <p>Chờ: {deadlockStep >= 3 ? (deadlockMode === "error" ? "HD01" : "L01") : "không"}</p>
              </div>
            </div>

            {/* Conflict Node */}
            <div className="flex flex-col items-center justify-center font-bold">
              {deadlockMode === "error" && deadlockStep >= 3 && !deadlockDb.s1Aborted && (
                <div className="text-rose-500 animate-bounce text-center space-y-1">
                  <AlertTriangle className="w-5 h-5 mx-auto text-rose-400" />
                  <span className="text-[8px] bg-rose-950 text-rose-400 border border-rose-900 px-1 rounded">DEADLOCK</span>
                </div>
              )}
              {deadlockDb.s1Aborted && (
                <div className="text-amber-500 text-center">
                  <ShieldAlert className="w-5 h-5 mx-auto" />
                  <span className="text-[8px] bg-amber-950 text-amber-400 border border-amber-900 px-1 rounded">ABORTED (S1)</span>
                </div>
              )}
              {deadlockStep < 3 && <ArrowRight className="w-4 h-4 text-slate-700 animate-pulse" />}
            </div>

            {/* Session 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-purple-950 border border-purple-800 text-purple-450 p-3 rounded-xl text-center">
                <User className="w-5 h-5 mx-auto mb-1" />
                <p className="text-[9px] font-black">SESSION 2</p>
                <p className="text-[8px] text-slate-500">(Quản lý)</p>
              </div>
              <div className="mt-2 space-y-0.5 text-slate-500 text-[8px]">
                <p>Giữ: {deadlockStep >= 2 ? "HD01" : "không"}</p>
                <p>Chờ: {deadlockStep >= 2 && deadlockMode === "error" ? "L01" : deadlockStep >= 2 && deadlockMode === "fixed" ? "HD01" : "không"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resources State */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[9px] font-bold block mb-1">TỒN KHO LÔ L01:</span>
            <div className="text-sm font-black text-emerald-400 flex justify-between items-center">
              <span>{deadlockDb.stock} chiếc</span>
              {deadlockStep >= 1 && (deadlockMode === "error" || deadlockStep >= 3) ? (
                <span className="text-[7px] bg-rose-950 text-rose-400 border border-rose-900 px-1 rounded flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> Lock (S1)
                </span>
              ) : (
                <span className="text-[7px] bg-slate-900 text-slate-500 px-1 rounded flex items-center gap-0.5">
                  <Unlock className="w-2.5 h-2.5" /> Free
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[9px] font-bold block mb-1">HÓA ĐƠN HD01:</span>
            <div className="text-xs font-bold text-slate-200 flex justify-between items-center">
              <div>
                <p>{deadlockDb.invoiceTotal.toLocaleString()}đ</p>
                <p className="text-[8px] text-slate-500 font-sans font-bold">{deadlockDb.invoiceStatus}</p>
              </div>
              {deadlockStep >= 2 ? (
                <span className="text-[7px] bg-rose-950 text-rose-400 border border-rose-900 px-1 rounded flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> Lock ({deadlockMode === "error" ? "S2" : "S1"})
                </span>
              ) : (
                <span className="text-[7px] bg-slate-900 text-slate-500 px-1 rounded flex items-center gap-0.5">
                  <Unlock className="w-2.5 h-2.5" /> Free
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SCENARIOS METADATA ---
  const scenarios: Array<{ id: ScenarioId; name: string; desc: string; icon: any; color: string }> = [
    { id: "phantom", name: "Phantom Read (Đọc ảo)", desc: "Xem sự xuất hiện của dòng mới chèn bởi session khác", icon: AlertTriangle, color: "from-blue-500 to-cyan-500" },
    { id: "lost_update", name: "Lost Update (Mất cập nhật)", desc: "Tranh chấp ghi đè dữ liệu làm mất cập nhật hợp lệ", icon: Lock, color: "from-amber-500 to-orange-500" },
    { id: "non_repeatable", name: "Non-repeatable (Đọc không lặp lại)", desc: "Giá trị dòng thay đổi giữa hai lần đọc trong một giao dịch", icon: Clock, color: "from-purple-500 to-indigo-500" },
    { id: "deadlock", name: "Deadlock (Bế tắc khóa chéo)", desc: "Hai session chờ khóa chéo nhau tạo vòng lặp vô hạn", icon: ShieldAlert, color: "from-rose-500 to-red-500" }
  ];

  const currentStep = getCurrentStepNum(activeScenario);
  const maxStepReached = isMaxStepReached(activeScenario);
  const stepsTimeline = getStepsTimeline(activeScenario);
  const logs = getLogs(activeScenario);

  return (
    <div className="flex flex-col w-full bg-[#030712] text-slate-100 min-h-screen relative font-sans overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Decorative Neon Light Globs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* 1. GLASSMORPHIC TOP NAVBAR */}
      <header className="w-full bg-[#090d16]/80 backdrop-blur-md border-b border-slate-800/80 z-50 sticky top-0 shadow-lg shadow-black/20">
        <div className="flex justify-between items-center px-6 py-4.5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group mr-2">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </div>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg shadow-indigo-500/20">
                <DatabaseZap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-black bg-gradient-to-r from-indigo-200 via-slate-100 to-blue-200 bg-clip-text text-transparent tracking-tight block">
                  ORACLE DB SIMULATOR
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block font-mono">
                  Advanced Concurrency & Isolation Labs
                </span>
              </div>
            </div>
          </div>

          {/* DB Mode & State Bar */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => {
                setDbMode("mock");
                resetScenario(activeScenario, "mock");
              }}
              className={`px-4.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                dbMode === "mock"
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/50"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Giả lập Client
            </button>
            <button
              onClick={() => {
                setDbMode("live");
                resetScenario(activeScenario, "live");
              }}
              className={`px-4.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                dbMode === "live"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/10 border border-emerald-500/30"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Oracle Live DB
            </button>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-4">
            {dbMode === "live" ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {systemPing !== null ? `ONLINE: ${systemPing}ms` : "CONNECTED"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="text-[10px] font-mono text-slate-500 font-bold">OFFLINE MODE</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-6 relative z-10">
        
        {/* Left column: SCENARIOS SELECTOR & PL/SQL ACADEMIC INFO */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-5">
          <div className="bg-[#0b101d]/60 backdrop-blur-md border border-slate-800 p-4.5 rounded-3xl space-y-3 shadow-xl">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">
              Danh sách kịch bản (Labs)
            </span>
            <div className="flex flex-col gap-2">
              {scenarios.map(sc => {
                const Icon = sc.icon;
                const isActive = activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setActiveScenario(sc.id);
                      resetScenario(sc.id);
                    }}
                    className={`text-left p-3 rounded-2xl border transition-all relative overflow-hidden group ${
                      isActive
                        ? "bg-slate-900/90 border-indigo-500/80 shadow-md shadow-indigo-500/5 text-white"
                        : "bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    {isActive && (
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${sc.color}`} />
                    )}
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-lg ${isActive ? "bg-indigo-600/10 text-indigo-400" : "bg-slate-900 text-slate-600 group-hover:text-slate-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? "text-slate-100" : "text-slate-400 group-hover:text-slate-200"}`}>{sc.name}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{sc.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Info & Explain Section */}
          <div className="bg-[#0b101d]/60 backdrop-blur-md border border-slate-800 p-4.5 rounded-3xl space-y-3 shadow-xl">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">
              Phân tích học thuật PL/SQL
            </span>
            {getAcademicExplanation(activeScenario)}
          </div>
        </section>

        {/* Right Area: Simulation Playfield (9 Columns Grid) */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          
          {/* Main Control Panel (Glass Card) */}
          <div className="bg-[#0b101d]/60 backdrop-blur-md border border-slate-800 p-5 rounded-3xl shadow-xl relative overflow-hidden">
            
            {/* Top decorative gradient light line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-950 text-indigo-450 border border-indigo-900/60 rounded text-[9px] font-mono font-bold uppercase">
                    LAB {scenarios.findIndex(s => s.id === activeScenario) + 1}
                  </span>
                  <h2 className="text-sm font-extrabold text-slate-100 tracking-tight">
                    {scenarios.find(s => s.id === activeScenario)?.name}
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {dbMode === "live" 
                    ? "Đang kết nối CSDL Oracle XE. Giao dịch, Row Locks và blocking diễn ra thời gian thực trên CSDL." 
                    : "Đang giả lập luồng. Toàn bộ locks và waits được hiển thị theo từng bước click."}
                </p>
              </div>

              {/* Fix/Mode Toggle Slider */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Môi trường:</span>
                <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      if (activeScenario === "phantom") setPhantomMode("error");
                      else if (activeScenario === "lost_update") setLostUpdateMode("error");
                      else if (activeScenario === "non_repeatable") setNonRepMode("error");
                      else if (activeScenario === "deadlock") setDeadlockMode("error");
                      resetScenario(activeScenario);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                      (activeScenario === "phantom" && phantomMode === "error") ||
                      (activeScenario === "lost_update" && lostUpdateMode === "error") ||
                      (activeScenario === "non_repeatable" && nonRepMode === "error") ||
                      (activeScenario === "deadlock" && deadlockMode === "error")
                        ? "bg-rose-600 text-white shadow-sm shadow-rose-600/10"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    Bị Lỗi
                  </button>
                  <button
                    onClick={() => {
                      if (activeScenario === "phantom") setPhantomMode("fixed");
                      else if (activeScenario === "lost_update") setLostUpdateMode("fixed");
                      else if (activeScenario === "non_repeatable") setNonRepMode("fixed");
                      else if (activeScenario === "deadlock") setDeadlockMode("fixed");
                      resetScenario(activeScenario);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                      (activeScenario === "phantom" && phantomMode === "fixed") ||
                      (activeScenario === "lost_update" && lostUpdateMode === "fixed") ||
                      (activeScenario === "non_repeatable" && nonRepMode === "fixed") ||
                      (activeScenario === "deadlock" && deadlockMode === "fixed")
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                        : "text-slate-500 hover:text-slate-400"
                    }`}
                  >
                    Đã Sửa
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-Step Controller Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Timeline Flow Steps */}
              <div className="md:col-span-8 space-y-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">
                  Các bước giao dịch (Stepping Timeline)
                </span>
                
                <div className="flex items-center gap-1.5 py-1">
                  {stepsTimeline.map((stepDesc, idx) => {
                    const stepNum = idx + 1;
                    const isCurrent = currentStep === stepNum;
                    const isCompleted = currentStep > stepNum;
                    
                    return (
                      <React.Fragment key={idx}>
                        {idx > 0 && (
                          <div className={`flex-1 h-[2px] transition-colors ${
                            isCompleted ? "bg-indigo-500/80" : "bg-slate-800"
                          }`} />
                        )}
                        <div 
                          className={`flex items-center justify-center w-7.5 h-7.5 rounded-full border text-[10px] font-black transition-all ${
                            isCurrent
                              ? "bg-indigo-650 border-indigo-400 text-white ring-4 ring-indigo-500/15 scale-105 shadow shadow-indigo-500/30"
                              : isCompleted
                              ? "bg-indigo-950/60 border-indigo-500/40 text-indigo-400"
                              : "bg-slate-950/80 border-slate-800 text-slate-500"
                          }`}
                          title={stepDesc}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
                
                {/* Active step narrative text */}
                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Bước {currentStep}: </span>
                  <span className="text-slate-350 font-medium">
                    {currentStep === 0 
                      ? "Bấm 'Bước tiếp theo' để gửi lệnh SQL và theo dõi cơ sở dữ liệu."
                      : stepsTimeline[currentStep - 1] || "Hoàn tất kịch bản."}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-4 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => resetScenario(activeScenario)}
                  className="px-4 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all flex-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={maxStepReached || apiLoading}
                  className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all flex-1 ${
                    maxStepReached
                      ? "bg-slate-950 border border-slate-900 text-slate-600 cursor-not-allowed"
                      : apiLoading
                      ? "bg-indigo-950 border border-indigo-900 text-indigo-400 cursor-wait"
                      : "bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/10 cursor-pointer"
                  }`}
                >
                  {apiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Oracle...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Bước tiếp
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* IDE Console Panel & DB State Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Box: DATAGRIP SQL CONSOLE STREAMS */}
            <div className="bg-[#0b101d]/60 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[480px]">
              
              {/* Console Header window control bar */}
              <div className="bg-slate-900/80 px-4.5 py-3.5 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <Terminal className="w-4 h-4 text-indigo-405 text-indigo-400" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                    Oracle SQL Developer Log
                  </span>
                </div>
                <span className="text-[8px] bg-slate-900 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono text-slate-500">
                  Dual Session
                </span>
              </div>

              {/* Console Stream content */}
              <div className="flex-1 p-4.5 font-mono text-[10.5px] overflow-y-auto bg-slate-950/90 scrollbar-thin scrollbar-thumb-slate-800">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 italic gap-2 select-none">
                    <Terminal className="w-7 h-7 text-slate-700 stroke-[1.5]" />
                    <p className="text-slate-500">Console trống. Bấm "Bước tiếp" để bắt đầu gửi các lệnh SQL.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log, i) => (
                      <div key={i} className="space-y-1 hover:bg-slate-900/30 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-900">
                        <div className="flex items-center justify-between text-[8px] text-slate-500 border-b border-slate-900/30 pb-0.5">
                          <span className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            log.session === 1 
                              ? "text-blue-400" 
                              : log.session === 2 
                              ? "text-purple-400" 
                              : "text-slate-500"
                          }`}>
                            <User className="w-2.5 h-2.5" />
                            {log.session === "system" ? "SYSTEM" : `SESSION ${log.session}`}
                          </span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className={`whitespace-pre-wrap leading-relaxed ${getLogClass(log.type)}`}>
                          {log.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: DB REAL-TIME GRID VIEWER */}
            <div className="bg-[#0b101d]/60 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[480px]">
              
              {/* DB Header */}
              <div className="bg-slate-900/80 px-4.5 py-3.5 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                    Oracle Grid View & Locks Monitor
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] text-slate-500 font-mono font-bold">
                    XE Instance
                  </span>
                </div>
              </div>

              {/* DB Grid Content */}
              <div className="flex-1 p-4.5 overflow-y-auto bg-slate-950/40">
                {activeScenario === "phantom" && renderPhantomDB()}
                {activeScenario === "lost_update" && renderLostUpdateDB()}
                {activeScenario === "non_repeatable" && renderNonRepDB()}
                {activeScenario === "deadlock" && renderDeadlockDB()}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
