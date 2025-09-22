/** @format */
"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Company = {
  companyId: string;
  email: string;
  name: string;
} | null;

const CompanyAuthContext = createContext<{
  company: Company;
  setCompany: (c: Company) => void;
}>({
  company: null,
  setCompany: () => {},
});

export const CompanyAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [company, setCompany] = useState<Company>(null);

  useEffect(() => {
    fetch("/api/company/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {

        if (data.company) {
          const { companyId, email, name } = data.company;
          const cleanCompany = { companyId, email, name };
          setCompany(cleanCompany);
        } else {
          setCompany(null);
        }
      })
      .catch((err) => console.error("CompanyAuth fetch error:", err));
  }, []);

  return (
    <CompanyAuthContext.Provider value={{ company, setCompany }}>
      {children}
    </CompanyAuthContext.Provider>
  );
};

export const useCompanyAuth = () => useContext(CompanyAuthContext);
