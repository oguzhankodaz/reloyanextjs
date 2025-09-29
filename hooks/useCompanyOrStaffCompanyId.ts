// hooks/useCompanyOrStaffCompanyId.ts
"use client";

import { useEffect, useState } from "react";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { useStaffAuth } from "@/context/StaffAuthContext";

export function useCompanyOrStaffCompanyId() {
  const { company } = useCompanyAuth();
  const { staff } = useStaffAuth();

  const derivedCompanyId = company?.companyId || staff?.companyId || null;
  const [companyId, setCompanyId] = useState<string | null>(derivedCompanyId);

  useEffect(() => {
    if (derivedCompanyId && derivedCompanyId !== companyId) {
      setCompanyId(derivedCompanyId);
      return;
    }

    if (!derivedCompanyId && !companyId) {
      let cancelled = false;
      (async () => {
        try {
          const [staffRes, cmpRes] = await Promise.all([
            fetch("/api/staff/me", { credentials: "include" })
              .then((r) => r.json())
              .catch(() => null),
            fetch("/api/company/me", { credentials: "include" })
              .then((r) => r.json())
              .catch(() => null),
          ]);
          const cid =
            staffRes?.staff?.companyId || cmpRes?.company?.companyId || null;
          if (!cancelled && cid) setCompanyId(cid);
        } catch {}
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [derivedCompanyId, companyId]);

  return companyId;
}
