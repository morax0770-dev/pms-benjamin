"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Lock } from "lucide-react";

export default function HQLayout({ children }: { children: React.ReactNode }) {
  const { isHQ } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isHQ) {
      router.replace("/dashboard");
    }
  }, [isHQ, router]);

  if (!isHQ) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="flex justify-center mb-3"><Lock size={36} color="#6b7280"/></div>
          <p className="text-sm font-semibold text-[#2d2d2d]">ไม่มีสิทธิ์เข้าถึง</p>
          <p className="text-xs text-[#6b7280] mt-1">หน้านี้สำหรับ HQ เท่านั้น</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
