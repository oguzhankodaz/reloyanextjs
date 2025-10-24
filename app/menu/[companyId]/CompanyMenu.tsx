"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Percent, UserPlus, ChevronDown } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  cashback: number;
}

interface Category {
  id: number;
  name: string;
  products: Product[];
}

interface Company {
  id: string;
  name: string;
  cashbackPercentage: number | null;
}

interface CompanyMenuProps {
  company: Company;
  categories: Category[];
}

export function CompanyMenu({ company, categories }: CompanyMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [productId: number]: boolean }>({});
  const [showCategoryProducts, setShowCategoryProducts] = useState(false);

  const filteredCategories = selectedCategory 
    ? categories.filter(cat => cat.id.toString() === selectedCategory)
    : categories;

  const toggleDescription = (productId: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryProducts(true);
  };

  const handleBackToCategories = () => {
    setShowCategoryProducts(false);
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Top Register Banner - Modern Siyah Tasarım */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-200">Reloya ile harcadıkça kazan</span>
            </div>
            <Link 
              href="/register"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-md text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
            >
              Üye Ol
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            {company.name}
          </h1>
        </div>

        {/* Ana İçerik */}
        {!showCategoryProducts ? (
          // Kategoriler Listesi
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Kategoriler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id.toString())}
                  className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-600 hover:border-orange-400/50 hover:bg-gray-700/80 transition-all duration-300 text-left group"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-orange-400 mb-2 group-hover:text-orange-300">
                      {category.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {category.products.length} ürün
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Seçili Kategori Ürünleri
          <div className="max-w-6xl mx-auto">
            {/* Geri Butonu */}
            <button
              onClick={handleBackToCategories}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>

            {/* Kategori Başlığı */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-orange-400 mb-2">
                {categories.find(cat => cat.id.toString() === selectedCategory)?.name}
              </h2>
              <p className="text-gray-400">
                {categories.find(cat => cat.id.toString() === selectedCategory)?.products.length} ürün
              </p>
            </div>

            {/* Ürünler Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories
                .find(cat => cat.id.toString() === selectedCategory)
                ?.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-600 overflow-hidden hover:shadow-lg hover:bg-gray-700/80 transition-all duration-300 hover:border-orange-400/50"
                  >
                    <div className="p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-orange-400 mb-3">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <div className="mb-4">
                          <p className={`text-gray-300 text-sm sm:text-base leading-relaxed ${
                            expandedDescriptions[product.id] ? '' : 'line-clamp-2'
                          }`}>
                            {product.description}
                          </p>
                          {product.description.length > 100 && (
                            <button
                              onClick={() => toggleDescription(product.id)}
                              className="text-cyan-400 text-sm font-medium mt-2 flex items-center hover:text-cyan-300 transition-colors"
                            >
                              {expandedDescriptions[product.id] ? 'Daha az göster' : 'Devamını oku'}
                              <ChevronDown 
                                className={`w-4 h-4 ml-1 transition-transform ${
                                  expandedDescriptions[product.id] ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xl sm:text-2xl font-bold text-green-400 bg-green-900/20 px-3 py-1 rounded-lg">
                          ₺{product.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

