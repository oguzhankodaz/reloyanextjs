// services/productService.ts
import { getCompanyProductsForUsers } from "@/actions/product";

export async function fetchProducts(companyId: string) {
  return await getCompanyProductsForUsers(companyId);
}
