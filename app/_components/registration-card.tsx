"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  GraduationCap,
  Link as LinkIcon,
  Copy,
  ChevronDown,
  User,
  CheckSquare,
  Globe2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// --- Internal UI Components (to keep it self-contained as requested) ---

function UserAvatar() {
  return (
    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/8 border border-white/8 flex items-center justify-center shrink-0">
      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white/50" />
    </div>
  );
}

function ContactInfo({
  icon: Icon,
  value,
  onCopy,
  label,
}: {
  icon: LucideIcon;
  value: string | null | undefined;
  onCopy: (e: React.MouseEvent, val: string, lab: string) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-white/50 group/item">
      <div className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
        <span className="font-medium text-[11px] sm:text-sm truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">
          {value || "-"}
        </span>
      </div>
      {value && (
        <button
          onClick={(e) => onCopy(e, value, label)}
          className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all text-white/40 cursor-pointer"
          title={`Copy ${label}`}
        >
          <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </button>
      )}
    </div>
  );
}

function InfoMetric({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white/3 rounded-xl p-4 flex gap-3 items-center border border-white/5">
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center",
          iconBg,
          iconColor,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm text-white/90 font-medium">{value}</p>
      </div>
    </div>
  );
}

// --- Main Registration Card Component ---

export function RegistrationCard({
  registration,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent, value: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  const formattedDate = formatDate(
    registration.createdAt || registration.created_at,
  );

  const phoneValue = registration.phoneNumber || null;

  return (
    <div
      className={cn(
        "w-full relative rounded-2xl overflow-hidden transition-all duration-300 group border border-white/6 bg-white/2 backdrop-blur-sm shadow-xs",
        isOpen && "",
      )}
    >
      {/* Header */}
      <div
        className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* User basic info */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <UserAvatar />
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-white/80 group-hover:text-white/90 transition-colors break-words">
              {registration.fullName || "Unknown"}
            </h3>
            {/* Desktop Contact - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-6 text-sm mt-1">
              <ContactInfo
                icon={Phone}
                value={phoneValue}
                onCopy={handleCopy}
                label="Phone number"
              />
              <ContactInfo
                icon={Mail}
                value={registration.email}
                onCopy={handleCopy}
                label="Email address"
              />
            </div>
          </div>
        </div>

        {/* Date and Mobile Phone Section */}
        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-5 w-full md:w-auto pt-3 md:pt-0 border-t border-white/5 md:border-t-0">
          {/* Mobile Phone/Email - Hidden on desktop */}
          <div className="sm:hidden flex flex-col gap-1 flex-1">
            <ContactInfo
              icon={Phone}
              value={phoneValue}
              onCopy={handleCopy}
              label="Phone number"
            />
            <ContactInfo
              icon={Mail}
              value={registration.email}
              onCopy={handleCopy}
              label="Email address"
            />
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
              Registered
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-white/60">
                {formattedDate}
              </span>
              <div
                className={cn(
                  "p-1 rounded-md bg-white/5 text-white/40 transition-transform duration-300",
                  isOpen && "rotate-180 text-white/80 bg-white/10",
                )}
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={cn(
          "grid transition-all duration-500 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="p-5 md:p-6 border-t border-white/6 bg-black/20 gap-6 flex flex-col">
            {/* Info Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoMetric
                icon={GraduationCap}
                label="University Attended"
                value={registration.universityAttended || "N/A"}
                iconBg="bg-purple-500/20"
                iconColor="text-purple-400"
              />
              <InfoMetric
                icon={CheckSquare}
                label="Will Attend Event"
                value={
                  registration.willAttend === "yes"
                    ? "Yes"
                    : registration.willAttend === "no"
                      ? "No"
                      : registration.willAttend || "N/A"
                }
                iconBg={
                  registration.willAttend === "yes"
                    ? "bg-emerald-500/20"
                    : "bg-amber-500/20"
                }
                iconColor={
                  registration.willAttend === "yes"
                    ? "text-emerald-400"
                    : "text-amber-400"
                }
              />
            </div>

            {/* Source Details link */}
            {/* {registration.sourceLink && (
              <div className="bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">
                  Complete Source URL
                </span>
                <a
                  href={registration.sourceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-400/80 hover:text-blue-400 underline break-all transition-colors font-medium"
                >
                  {registration.sourceLink}
                </a>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
