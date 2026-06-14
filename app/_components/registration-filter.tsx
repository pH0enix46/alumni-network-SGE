"use client";
import { useState, useEffect, useDeferredValue, use } from "react";

import {
  Search,
  Calendar as CalendarIcon,
  X,
  LogOut,
  FileSpreadsheet,
  Database,
  Users,
  ChevronDown,
  RotateCw,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { RegistrationCard } from "./registration-card";
import { logoutAction } from "@/app/_server/action";
import { cn } from "@/lib/utils";
import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";

// --- Date Picker Component ---
function DatePicker({
  date,
  onChange,
}: {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
}) {
  return (
    <div className="relative flex items-center w-full md:w-auto">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full md:w-[240px] h-10 justify-start text-left font-normal bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:text-white transition-all shadow-xs pr-10",
              !date && "text-white/30",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-slate-950 border-white/10 shadow-2xl backdrop-blur-xl rounded-[28px] overflow-hidden"
          align="start"
          sideOffset={8}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {date && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange(undefined);
          }}
          className="absolute right-3 p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// --- Main Filter Component ---
export function RegistrationFilter({
  registrationsPromise,
}: {
  registrationsPromise: Promise<any[]>;
}) {
  const registrations = use(registrationsPromise);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const search = searchParams.get("query") || "";
  const dateParam = searchParams.get("date");
  const date = dateParam ? new Date(dateParam + "T00:00:00") : undefined;
  const attendanceParam = searchParams.get("attendance") || "all";

  const [searchTerm, setSearchTerm] = useState(search);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [localDate, setLocalDate] = useState<Date | undefined>(date);
  const [attendanceFilter, setAttendanceFilter] = useState(attendanceParam);

  // Sync URL with local state (Instant and Non-blocking 'Soft' Update)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (searchTerm) params.set("query", searchTerm);
    else params.delete("query");

    if (localDate) params.set("date", format(localDate, "yyyy-MM-dd"));
    else params.delete("date");

    if (attendanceFilter && attendanceFilter !== "all")
      params.set("attendance", attendanceFilter);
    else params.delete("attendance");

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    if (window.location.search !== (queryString ? `?${queryString}` : "")) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [searchTerm, localDate, attendanceFilter]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("query") || "";
      const d = params.get("date");
      const a = params.get("attendance") || "all";
      setSearchTerm(q);
      setLocalDate(d ? new Date(d + "T00:00:00") : undefined);
      setAttendanceFilter(a);
      setCurrentPage(1);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const clearAll = () => {
    setSearchTerm("");
    setLocalDate(undefined);
    setAttendanceFilter("all");
    setCurrentPage(1);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/login";
  };

  const handleExport = (type: "excel" | "crm") => {
    const params = new URLSearchParams();
    params.set("type", type);
    if (localDate) {
      params.set("date", format(localDate, "yyyy-MM-dd"));
    }
    if (searchTerm) {
      params.set("query", searchTerm);
    }
    if (attendanceFilter && attendanceFilter !== "all") {
      params.set("attendance", attendanceFilter);
    }

    // Use a hidden anchor to trigger download without opening a new 'black' tab
    const url = `/api/export?${params.toString()}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `export-${type}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDateChange = (d: Date | undefined) => {
    setLocalDate(d);
    setCurrentPage(1);
  };

  // Filtering happens on LOCAL state for instant response
  const filteredRegistrations = registrations.filter((reg) => {
    // Date filter first (fastest)
    const regDate = reg.createdAt || reg.created_at;
    const matchesDate =
      !localDate || (regDate && isSameDay(new Date(regDate), localDate));

    if (!matchesDate) return false;

    // Attendance filter
    if (attendanceFilter !== "all") {
      const regAttend = (reg.willAttend || "").toLowerCase().trim();
      if (regAttend !== attendanceFilter) return false;
    }

    // Search filter
    const s = deferredSearchTerm.toLowerCase().trim();
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

  const totalItems = filteredRegistrations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const hasFilters = searchTerm || localDate || attendanceFilter !== "all";

  return (
    <div className="space-y-10 pb-32">
      <div className="flex flex-col items-center gap-8 py-6">
        {/* Centered Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent tracking-tight">
            Alumni Network Portal
          </h1>
          <p className="text-white/40 text-sm sm:text-base max-w-xl mx-auto px-4">
            Manage alumni registrations, check attendance status, and export
            database records
          </p>
        </div>

        {/* Filters and Actions Bar */}
        <div className="relative flex flex-wrap items-center justify-center gap-3 w-full max-w-6xl">
          {/* Mobile Clear All Button */}
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={clearAll}
              className="md:hidden absolute -bottom-10 right-0 h-7 px-2 bg-red-300 border border-red-400/50 text-red-500 hover:text-red-400 hover:bg-red-400/10 transition-all hover:border-red-400/20 cursor-pointer shrink-0 z-20"
            >
              <X className="h-4 w-4 mr-1 text-red-500 font-bold" />
              Clear
            </Button>
          )}

          {/* Search Input */}
          <div className="relative group w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search attendees..."
              className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-hidden focus:border-primary/50 focus:bg-white/8 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/90 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Date Picker */}
          <div className="w-full sm:w-auto">
            <DatePicker date={localDate} onChange={handleDateChange} />
          </div>

          {/* Attendance Filter Select Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={attendanceFilter}
              onChange={(e) => {
                setAttendanceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-44 h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white/90 focus:outline-hidden focus:border-primary/50 transition-all appearance-none cursor-pointer pr-8"
            >
              <option value="all" className="bg-slate-950 text-white/90">
                All Attendance
              </option>
              <option value="yes" className="bg-slate-950 text-white/90">
                Attending (Yes)
              </option>
              <option value="no" className="bg-slate-950 text-white/90">
                Not Attending (No)
              </option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Clear All (Desktop Only) */}
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={clearAll}
              className="hidden md:flex h-10 px-3 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20 cursor-pointer shrink-0"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}

          {/* Divider (Desktop) */}
          <div className="hidden sm:block w-px h-6 bg-white/10 mx-2" />

          {/* Export Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => handleExport("excel")}
              className="flex-1 sm:flex-none h-10 px-4 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 cursor-pointer transition-all rounded-xl"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("crm")}
              className="flex-1 sm:flex-none h-10 px-4 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/30 cursor-pointer transition-all rounded-xl"
            >
              <Database className="h-4 w-4 mr-2" />
              CRM
            </Button>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto h-10 px-4 bg-white/5 border-white/10 text-white/60 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 cursor-pointer transition-all rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2 text-red-400" />
            Logout
          </Button>
        </div>
      </div>

      {/* Total Summary */}
      <div className="flex items-center justify-between px-1 w-full">
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/6 border border-white/8 rounded-full backdrop-blur-md animate-in fade-in slide-in-from-left-4 duration-500">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
            Total Alumni
          </span>
          <div className="w-px h-3 bg-white/10 mx-1" />
          <span className="text-white/90 text-base font-bold leading-none">
            {registrations.length}
          </span>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="h-8 px-3 bg-white/6 border border-white/8 text-white/70 hover:text-white hover:bg-white/10 rounded-full cursor-pointer transition-all text-xs flex items-center"
          disabled={isRefreshing}
        >
          <RotateCw className={cn("h-3.5 w-3.5 mr-1.5 text-primary", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Data List */}
      <div className="space-y-4 min-h-[400px] -mt-6">
        {filteredRegistrations.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center animate-in fade-in duration-500">
            <p className="text-white/60">
              {registrations.length === 0
                ? "No registrations found."
                : "No registrations match your filters."}
            </p>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="mt-4 text-blue-700 text-shadow-xs hover:underline text-sm font-medium cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {paginatedRegistrations.map((reg: any, index: number) => (
              <div
                key={reg._id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
              >
                <RegistrationCard registration={reg} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination and Status Bar (Floating) */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <div className="text-white/40 text-[11px] sm:text-xs font-medium text-center sm:text-left">
              Showing <span className="text-white/70">{startIndex + 1}</span>-
              <span className="text-white/70">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="text-white/70">{totalItems}</span>{" "}
              registrations
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 p-0 bg-white/5 border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all"
                >
                  {"<"}
                </Button>
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "h-8 w-8 p-0 text-xs transition-all",
                          currentPage === pageNum
                            ? "bg-primary hover:bg-primary/90 text-white border-transparent shadow-lg shadow-primary/20"
                            : "bg-white/5 border-white/10 text-white/50 hover:text-white",
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="h-8 w-8 p-0 bg-white/5 border-white/10 text-white/50 hover:text-white disabled:opacity-30 transition-all"
                >
                  {">"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
