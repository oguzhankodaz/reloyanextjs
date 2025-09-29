// services/productService.ts
import { getProductsByCompanyAction } from "@/actions/product";

export async function fetchProducts(companyId: string) {
  return await getProductsByCompanyAction(companyId);
}
