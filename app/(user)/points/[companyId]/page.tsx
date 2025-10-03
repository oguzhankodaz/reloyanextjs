/** @format */
"use client";

import { use } from "react";
import CompanyProductsClient from "./CompanyProductsClient";

export default function CompanyProductsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = use(params);

  return <CompanyProductsClient companyId={companyId} />;
}
