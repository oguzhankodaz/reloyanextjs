"use client";
import React from "react";

type Props = {
  companyId: string | null;
  onSuccess: () => void;
  createProductAction: (prevState: any, formData: FormData) => Promise<any>;
};

const ProductForm: React.FC<Props> = ({ companyId, onSuccess, createProductAction }) => {
  return (
    <form
      action={async (formData) => {
        const res = await createProductAction(null, formData);
        if (res.success) {
          onSuccess();
        } else {
          alert(res.message);
        }
      }}
      className="space-y-3 mb-6"
    >
      <input type="text" name="name" placeholder="Ürün adı" className="w-full px-3 py-2 border rounded" required />
      <input type="number" name="price" placeholder="Fiyat" className="w-full px-3 py-2 border rounded" required />
      <div className="grid grid-cols-2 gap-3">
        <input type="number" name="pointsToBuy" placeholder="Satın alma puanı" className="w-full px-3 py-2 border rounded" />
        <input type="number" name="pointsOnSell" placeholder="Satış puanı" className="w-full px-3 py-2 border rounded" />
      </div>

      <input type="hidden" name="companyId" value={companyId || ""} />

      <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
        + Ürün Ekle
      </button>
    </form>
  );
};

export default ProductForm;
