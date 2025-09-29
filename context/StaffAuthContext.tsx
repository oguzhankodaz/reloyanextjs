/** @format */
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toTitleCase } from "@/lib/helpers";

type Staff = {
  staffId: string;
  email: string;
  name: string;
  companyId: string; // ✅ ekle
} | null;

const StaffAuthContext = createContext<{
  staff: Staff;
  setStaff: (s: Staff) => void;
}>({
  staff: null,
  setStaff: () => {},
});

export const StaffAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [staff, setStaff] = useState<Staff>(null);

  useEffect(() => {
    fetch("/api/staff/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.staff) {
          const { staffId, email, name, companyId } = data.staff;
          setStaff({ staffId, email, name: toTitleCase(name), companyId });
        } else {
          setStaff(null);
        }
      })
      .catch((err) => {
        console.error("StaffAuth fetch error:", err);
        setStaff(null);
      });
  }, []);

  return (
    <StaffAuthContext.Provider value={{ staff, setStaff }}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = () => useContext(StaffAuthContext);
