import { NextRequest, NextResponse } from "next/server";
import { getAdminHeaders } from "@/app/_server/data-access";
import ExcelJS from "exceljs";
import { isSameDay } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // 'excel' or 'crm'
  const date = searchParams.get("date");
  const queryParam = searchParams.get("query");
  const attendance = searchParams.get("attendance");

  const API_BASE = process.env.BACKEND_URL || "https://api.shabujglobal.com";
  const headers = await getAdminHeaders({ json: true });

  try {
    // 1. Fetch registrations from the backend list API
    let allRegistrations: any[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const listQuery = new URLSearchParams({
        perPage: "100", // Fetch 100 at a time
        page: page.toString(),
        sortBy: "desc",
      });

      const listRes = await fetch(`${API_BASE}/alumni-network?${listQuery.toString()}`, {
        headers,
      });

      if (!listRes.ok) {
        const errorText = await listRes.text();
        console.error(`Backend list error (page ${page}):`, errorText);
        break;
      }

      const payload = await listRes.json();
      allRegistrations = [...allRegistrations, ...(payload.data || [])];
      totalPages = payload.totalPages || 1;
      page++;
    } while (page <= totalPages);

    // 2. Filter registrations using the same logic as the frontend
    const filteredRegistrations = allRegistrations.filter((reg: any) => {
      // Date filter
      const regDate = reg.createdAt || reg.created_at;
      const matchesDate = !date || (regDate && isSameDay(new Date(regDate), new Date(date)));
      if (!matchesDate) return false;

      // Attendance filter
      if (attendance && attendance !== "all") {
        const regAttend = (reg.willAttend || "").toLowerCase().trim();
        if (regAttend !== attendance) return false;
      }

      // Search filter
      const s = (queryParam || "").toLowerCase().trim();
      
      // Filter out test registrations (consistent with dashboard)
      const name = (reg.fullName || "").toLowerCase();
      if ((name.includes("test") || name.includes("tst")) && !s.includes("test") && !s.includes("tst")) return false;

      if (!s) return true;

      const searchDigits = s.replace(/\D/g, "");
      const regPhone = (reg.phoneNumber || "").toString().toLowerCase();
      const regFullPhone = ((reg.countryCode || "") + (reg.phoneNumber || ""))
        .toString()
        .replace(/\D/g, "");

      return (
        (reg.fullName || "").toLowerCase().includes(s) ||
        (reg.email || "").toLowerCase().includes(s) ||
        regPhone.includes(s) ||
        (searchDigits && regFullPhone.includes(searchDigits)) ||
        (reg.universityAttended || "").toLowerCase().includes(s) ||
        (reg.sourceName || "").toLowerCase().includes(s)
      );
    });

    if (filteredRegistrations.length === 0) {
      return NextResponse.json({ error: "No registrations found matching the filters" }, { status: 404 });
    }

    // 3. Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(type === "crm" ? "CRM_Export" : "Alumni Registrations");

    if (type === "crm") {
      // CRM Format
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Email", key: "email", width: 30 },
        { header: "Name", key: "name", width: 25 },
        { header: "Phone", key: "phone", width: 20 },
        { header: "University Attended", key: "university", width: 30 },
        { header: "Will Attend Event", key: "willAttend", width: 18 },
        { header: "Source Name", key: "sourceName", width: 20 },
        { header: "Source Link", key: "sourceLink", width: 35 },
      ];

      filteredRegistrations.forEach((reg: any) => {
        let dateVal = "N/A";
        if (reg.createdAt) {
          const d = new Date(reg.createdAt);
          dateVal = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
        }

        const phone = reg.phoneNumber ? reg.phoneNumber : "N/A";

        worksheet.addRow({
          date: dateVal,
          email: reg.email || "N/A",
          name: reg.fullName || "N/A",
          phone,
          university: reg.universityAttended || "N/A",
          willAttend: reg.willAttend === "yes" ? "Yes" : reg.willAttend === "no" ? "No" : reg.willAttend || "N/A",
          sourceName: reg.sourceName || "N/A",
          sourceLink: reg.sourceLink || "N/A",
        });
      });
    } else {
      // Standard Excel Format
      worksheet.columns = [
        { header: "Full Name", key: "fullName", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone Number", key: "phoneNumber", width: 20 },
        { header: "University Attended", key: "universityAttended", width: 30 },
        { header: "Will Attend Event", key: "willAttend", width: 18 },
        { header: "Source Name", key: "sourceName", width: 20 },
        { header: "Source Link", key: "sourceLink", width: 35 },
        { header: "Created At", key: "createdAt", width: 25 },
      ];

      filteredRegistrations.forEach((reg: any) => {
        worksheet.addRow({
          fullName: reg.fullName || "",
          email: reg.email || "",
          phoneNumber: reg.phoneNumber || "",
          universityAttended: reg.universityAttended || "",
          willAttend: reg.willAttend === "yes" ? "Yes" : reg.willAttend === "no" ? "No" : reg.willAttend || "N/A",
          sourceName: reg.sourceName || "",
          sourceLink: reg.sourceLink || "",
          createdAt: reg.createdAt ? new Date(reg.createdAt).toLocaleString() : "N/A",
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=export-${type}-${new Date().getTime()}.xlsx`,
      },
    });
  } catch (error: any) {
    console.error("Export API error:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
