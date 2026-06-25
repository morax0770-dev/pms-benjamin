"use client";

import { useRole } from "@/context/RoleContext";
import { useRouter } from "next/navigation";

export function RoleSwitcher() {
  const { currentKey, isLoggedIn, login, logout, session } = useRole();
  const router = useRouter();

  const handleSwitch = (key: "hq" | "dealer") => {
    login(key);
    router.push(key === "hq" ? "/hq/dashboard" : "/dashboard");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#2D2D2D] text-white text-xs px-3 py-2 rounded-xl shadow-lg">
      <span style={{ color: "rgba(255,255,255,.4)", fontSize: "0.65rem" }}>ทดสอบ:</span>
      <button
        onClick={() => handleSwitch("dealer")}
        style={{
          padding: "3px 10px", borderRadius: 8, fontWeight: 600, fontSize: "0.72rem",
          background: isLoggedIn && currentKey === "dealer" ? "#003366" : "transparent",
          color: isLoggedIn && currentKey === "dealer" ? "#fff" : "rgba(255,255,255,.5)",
          border: "none", cursor: "pointer", transition: "all .15s",
        }}
      >
        ดีลเลอร์
      </button>
      <span style={{ color: "rgba(255,255,255,.2)" }}>|</span>
      <button
        onClick={() => handleSwitch("hq")}
        style={{
          padding: "3px 10px", borderRadius: 8, fontWeight: 600, fontSize: "0.72rem",
          background: isLoggedIn && currentKey === "hq" ? "#C0C0C0" : "transparent",
          color: isLoggedIn && currentKey === "hq" ? "#2D2D2D" : "rgba(255,255,255,.5)",
          border: "none", cursor: "pointer", transition: "all .15s",
        }}
      >
        HQ
      </button>
      {isLoggedIn && (
        <>
          <span style={{ color: "rgba(255,255,255,.2)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,.5)", maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.7rem" }}>
            {session.name}
          </span>
          <span style={{ color: "rgba(255,255,255,.2)" }}>·</span>
          <button
            onClick={handleLogout}
            style={{ fontSize: "0.68rem", color: "#f04d6a", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            ออก
          </button>
        </>
      )}
    </div>
  );
}
