import { Suspense } from "react";
import { getRegistrations } from "@/app/_server/data-access";
import { RegistrationFilter } from "@/app/_components/registration-filter";

export default function DashboardPage() {
  // We don't await here. We pass the promise to the component.
  const registrationsPromise = getRegistrations();

  return (
    <div className="min-h-screen bg-bg-primary text-white/90 p-3 xs:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
             <div className="animate-pulse text-white/20 font-medium">Loading registrations...</div>
          </div>
        }>
          <RegistrationFilter registrationsPromise={registrationsPromise} />
        </Suspense>
      </div>
    </div>
  );
}
