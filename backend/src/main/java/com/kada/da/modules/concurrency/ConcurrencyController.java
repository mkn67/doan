package com.kada.da.modules.concurrency;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

@RestController
@RequestMapping("/api/concurrency")
public class ConcurrencyController {

    @Autowired
    private DataSource dataSource;

    private Connection conn1;
    private Connection conn2;
    private Statement activeStmt1;
    private Statement activeStmt2;

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetSimulation() {
        Map<String, Object> response = new HashMap<>();
        try {
            // 1. Close old connections
            cleanupConnections();

            // 2. Open new connections from pool
            conn1 = dataSource.getConnection();
            conn2 = dataSource.getConnection();

            conn1.setAutoCommit(false);
            conn2.setAutoCommit(false);

            // 3. Reset database records to a clean starting state for the demos
            try (Connection setupConn = dataSource.getConnection()) {
                setupConn.setAutoCommit(true);
                try (Statement stmt = setupConn.createStatement()) {
                    // Disable triggers temporarily to clean up data easily without constraints
                    try {
                        stmt.execute("ALTER TRIGGER TRG_VALIDATE_HOA_DON DISABLE");
                        stmt.execute("ALTER TRIGGER TRG_CT_HOA_DON_SP DISABLE");
                        stmt.execute("ALTER TRIGGER TRG_HOA_DON_HUY DISABLE");
                    } catch (SQLException ignored) {}

                    // Cleanup old demo data
                    stmt.execute("DELETE FROM THANH_TOAN WHERE MAHD IN ('HD01', 'HD001', 'HD002')");
                    stmt.execute("DELETE FROM CT_HOA_DON WHERE MAHD IN ('HD01', 'HD001', 'HD002')");
                    stmt.execute("DELETE FROM CT_HOA_DON_DV WHERE MAHD IN ('HD01', 'HD001', 'HD002')");
                    stmt.execute("DELETE FROM LICH_SU_DIEM WHERE MAHD IN ('HD01', 'HD001', 'HD002')");
                    stmt.execute("DELETE FROM KH_KHUYEN_MAI WHERE MAHD IN ('HD01', 'HD001', 'HD002')");
                    stmt.execute("DELETE FROM HOA_DON WHERE MAHD IN ('HD01', 'HD001', 'HD002')");
                    stmt.execute("DELETE FROM LICH_HEN WHERE MALH IN ('LH000001', 'LH000002')");
                    stmt.execute("DELETE FROM LO_HANG WHERE MALO = 'L01'");

                    // Re-enable triggers
                    try {
                        stmt.execute("ALTER TRIGGER TRG_VALIDATE_HOA_DON ENABLE");
                        stmt.execute("ALTER TRIGGER TRG_CT_HOA_DON_SP ENABLE");
                        stmt.execute("ALTER TRIGGER TRG_HOA_DON_HUY ENABLE");
                    } catch (SQLException ignored) {}

                    // Insert fresh demo records
                    // Appointment demo state
                    stmt.execute("INSERT INTO LICH_HEN (MALH, MAKH, MANS, MAGOI, NGAYHEN, GIO_HEN, LOAI_LICH, TRANGTHAI) " +
                            "VALUES ('LH000001', 'KH002', 'NS005', 'GK01', SYSDATE, SYSTIMESTAMP, N'Online', N'Mới')");

                    // Inventory batch L01
                    stmt.execute("INSERT INTO LO_HANG (MALO, MASP, MAPN, NGAYSANXUAT, NGAYHETHAN, SOLUONGNHAP, SOLUONGTON, GIANHAP) " +
                            "VALUES ('L01', 'SP001', 'PN_S01', SYSDATE, SYSDATE + 365, 100, 100, 220000)");

                    // Invoice HD01
                    stmt.execute("INSERT INTO HOA_DON (MAHD, MAKH, MANS, TONGTIEN, TRANGTHAI) " +
                            "VALUES ('HD01', 'KH002', 'NS010', 500000, N'Chưa thanh toán')");
                }
            }

            response.put("status", "success");
            response.put("message", "Database reset and Session 1 & Session 2 initialized successfully.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Reset failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeQuery(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String sessionStr = request.get("session");
        String sql = request.get("sql");

        if (sessionStr == null || sql == null) {
            response.put("status", "error");
            response.put("message", "Missing session or sql parameters");
            return ResponseEntity.badRequest().body(response);
        }

        int session = Integer.parseInt(sessionStr);
        Connection conn = (session == 1) ? conn1 : conn2;

        if (conn == null) {
            response.put("status", "error");
            response.put("message", "Session connection not initialized. Please reset/start simulation first.");
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(response);
        }

        try {
            // Trim and clean statement
            String cleanSql = sql.trim();
            if (cleanSql.endsWith(";")) {
                cleanSql = cleanSql.substring(0, cleanSql.length() - 1);
            }

            // Standard Commit / Rollback actions via JDBC Connection
            if (cleanSql.equalsIgnoreCase("COMMIT")) {
                conn.commit();
                response.put("status", "success");
                response.put("type", "update");
                response.put("message", "Transaction committed successfully");
                return ResponseEntity.ok(response);
            }

            if (cleanSql.equalsIgnoreCase("ROLLBACK")) {
                conn.rollback();
                response.put("status", "success");
                response.put("type", "update");
                response.put("message", "Transaction rolled back successfully");
                return ResponseEntity.ok(response);
            }

            // Normal statement execution
            Statement stmt = null;
            try {
                stmt = conn.createStatement();
                if (session == 1) {
                    activeStmt1 = stmt;
                } else {
                    activeStmt2 = stmt;
                }

                // Set statement timeout to prevent lock waits from hanging backend threads indefinitely
                stmt.setQueryTimeout(300);

                boolean hasResultSet = stmt.execute(cleanSql);

                if (hasResultSet) {
                    try (ResultSet rs = stmt.getResultSet()) {
                        List<Map<String, Object>> rows = new ArrayList<>();
                        ResultSetMetaData metaData = rs.getMetaData();
                        int columnCount = metaData.getColumnCount();

                        while (rs.next()) {
                            Map<String, Object> row = new LinkedHashMap<>();
                            for (int i = 1; i <= columnCount; i++) {
                                String colName = metaData.getColumnName(i);
                                Object val = rs.getObject(i);
                                // Handle Oracle timestamps and dates for JSON rendering
                                if (val instanceof Timestamp) {
                                    val = val.toString();
                                }
                                row.put(colName, val);
                            }
                            rows.add(row);
                        }
                        response.put("status", "success");
                        response.put("type", "query");
                        response.put("data", rows);
                    }
                } else {
                    int updateCount = stmt.getUpdateCount();
                    response.put("status", "success");
                    response.put("type", "update");
                    response.put("updateCount", updateCount);
                    response.put("message", "Statement executed successfully. Rows affected: " + updateCount);
                }
            } finally {
                if (stmt != null) {
                    try { stmt.close(); } catch (SQLException ignored) {}
                }
                if (session == 1) {
                    activeStmt1 = null;
                } else {
                    activeStmt2 = null;
                }
            }

            return ResponseEntity.ok(response);

        } catch (SQLException e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            response.put("errorCode", e.getErrorCode());
            response.put("sqlState", e.getSQLState());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/state")
    public ResponseEntity<Map<String, Object>> getDatabaseState() {
        Map<String, Object> response = new HashMap<>();
        try (Connection queryConn = dataSource.getConnection()) {
            queryConn.setAutoCommit(true);
            try (Statement stmt = queryConn.createStatement()) {
                // Get LICH_HEN table
                List<Map<String, Object>> appointments = new ArrayList<>();
                try (ResultSet rs = stmt.executeQuery("SELECT MALH, MAKH, MANS, MAGOI, TO_CHAR(NGAYHEN, 'DD-MM-YYYY') as NGAYHEN, TO_CHAR(GIO_HEN, 'HH24:MI:SS') as GIO_HEN, LOAI_LICH, TRANGTHAI FROM LICH_HEN WHERE MALH IN ('LH000001', 'LH000002') ORDER BY MALH")) {
                    appointments = mapResultSet(rs);
                }
                response.put("appointments", appointments);

                // Get LO_HANG table
                List<Map<String, Object>> stocks = new ArrayList<>();
                try (ResultSet rs = stmt.executeQuery("SELECT MALO, MASP, SOLUONGTON FROM LO_HANG WHERE MALO = 'L01'")) {
                    stocks = mapResultSet(rs);
                }
                response.put("stocks", stocks);

                // Get HOA_DON table
                List<Map<String, Object>> invoices = new ArrayList<>();
                try (ResultSet rs = stmt.executeQuery("SELECT MAHD, MAKH, TONGTIEN, TRANGTHAI FROM HOA_DON WHERE MAHD = 'HD01'")) {
                    invoices = mapResultSet(rs);
                }
                response.put("invoices", invoices);

                // Get CT_HOA_DON table
                List<Map<String, Object>> sales = new ArrayList<>();
                try (ResultSet rs = stmt.executeQuery("SELECT MAHD, MALO, SOLUONG, DONGIA FROM CT_HOA_DON WHERE MAHD IN ('HD001', 'HD002', 'HD01')")) {
                    sales = mapResultSet(rs);
                }
                response.put("sales", sales);

                // Get THANH_TOAN table
                List<Map<String, Object>> payments = new ArrayList<>();
                try (ResultSet rs = stmt.executeQuery("SELECT MATT, MAHD, MANS, TO_CHAR(NGAYTHANHTOAN, 'HH24:MI:SS') as NGAYTHANHTOAN, SOTIEN, PHUONGTHUC, TRANGTHAI FROM THANH_TOAN WHERE MAHD = 'HD01'")) {
                    payments = mapResultSet(rs);
                }
                response.put("payments", payments);
            }
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private List<Map<String, Object>> mapResultSet(ResultSet rs) throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        ResultSetMetaData meta = rs.getMetaData();
        int cols = meta.getColumnCount();
        while (rs.next()) {
            Map<String, Object> row = new LinkedHashMap<>();
            for (int i = 1; i <= cols; i++) {
                row.put(meta.getColumnName(i).toLowerCase(), rs.getObject(i));
            }
            list.add(row);
        }
        return list;
    }

    private void cleanupConnections() {
        if (activeStmt1 != null) {
            try { activeStmt1.cancel(); } catch (SQLException ignored) {}
            activeStmt1 = null;
        }
        if (activeStmt2 != null) {
            try { activeStmt2.cancel(); } catch (SQLException ignored) {}
            activeStmt2 = null;
        }
        if (conn1 != null) {
            try { conn1.rollback(); conn1.close(); } catch (SQLException ignored) {}
            conn1 = null;
        }
        if (conn2 != null) {
            try { conn2.rollback(); conn2.close(); } catch (SQLException ignored) {}
            conn2 = null;
        }
    }
}
