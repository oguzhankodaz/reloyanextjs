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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = selectedCategory
    ? categories.filter(cat => cat.id.toString() === selectedCategory)
    : categories;

  // Arama fonksiyonu
  const filteredProducts = (products: Product[]) => {
    if (!searchQuery.trim()) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

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

        {/* Arama Çubuğu */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/70 backdrop-blur-sm border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Ana İçerik */}
        {!showCategoryProducts && !searchQuery.trim() ? (
          // Kategoriler Listesi - Sadece arama yokken
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
          // Ürünler Listesi (Arama veya Kategori Seçimi)
          <div className="max-w-6xl mx-auto">
            {/* Geri Butonu - Sadece kategori seçiminde göster */}
            {showCategoryProducts && !searchQuery.trim() && (
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Geri
              </button>
            )}

            {/* Başlık */}
            <div className="text-center mb-8">
              {searchQuery.trim() ? (
                <>
                  <h2 className="text-2xl font-bold text-orange-400 mb-2">Arama Sonuçları</h2>
                  <p className="text-gray-400">"{searchQuery}" için bulunan ürünler</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-orange-400 mb-2">
                    {categories.find(cat => cat.id.toString() === selectedCategory)?.name}
                  </h2>
                  <p className="text-gray-400">
                    {categories.find(cat => cat.id.toString() === selectedCategory)?.products.length} ürün
                  </p>
                </>
              )}
            </div>

            {/* Ürünler Liste */}
            <div className="max-w-4xl mx-auto">
              {(() => {
                // Arama varsa tüm ürünleri, yoksa seçili kategorinin ürünlerini al
                const allProducts = categories.flatMap(cat => cat.products);
                const currentCategory = categories.find(cat => cat.id.toString() === selectedCategory);
                const products = searchQuery.trim() ? allProducts : (currentCategory?.products || []);
                const filtered = filteredProducts(products);

                if (filtered.length === 0 && searchQuery.trim()) {
                  return (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">Ürün bulunamadı</h3>
                      <p className="text-gray-400">"{searchQuery}" araması için sonuç bulunamadı</p>
                    </div>
                  );
                }

                return (
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-600 overflow-hidden">
                    {filtered.map((product, index) => (
                      <div
                        key={product.id}
                        className={`p-4 border-b border-gray-600 hover:bg-gray-700/50 transition-colors ${index === filtered.length - 1 ? 'border-b-0' : ''
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          {/* Sol taraf - Ürün bilgileri */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-orange-400 mb-1">
                              {product.name}
                            </h3>

                            {product.description && (
                              <div className="mb-2">
                                <p className={`text-gray-300 text-sm leading-relaxed ${expandedDescriptions[product.id] ? '' : 'line-clamp-1'
                                  }`}>
                                  {product.description}
                                </p>
                                {product.description.length > 60 && (
                                  <button
                                    onClick={() => toggleDescription(product.id)}
                                    className="text-cyan-400 text-xs font-medium mt-1 flex items-center hover:text-cyan-300 transition-colors"
                                  >
                                    {expandedDescriptions[product.id] ? 'Daha az göster' : 'Devamını oku'}
                                    <ChevronDown
                                      className={`w-3 h-3 ml-1 transition-transform ${expandedDescriptions[product.id] ? 'rotate-180' : ''
                                        }`}
                                    />
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Cashback bilgisi - küçük */}
                            <div className="text-xs text-gray-400">
                            <Link 
                                href="https://reloya.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-blue-400 hover:text-blue-300 underline text-xs"
                              >
                              <span className="text-gray-400">Reloya ile hemen </span>
                              <span className="text-green-400 font-semibold">₺{(product.price * 0.03).toFixed(2)}</span>
                              <span className="text-gray-400"> puan kazan</span>
                          
                              
                              </Link>
                            </div>
                          </div>

                          {/* Sağ taraf - Fiyat */}
                          <div className="ml-4 flex-shrink-0">
                            <div className="text-xl font-bold text-green-400 bg-green-900/20 px-3 py-1 rounded-lg">
                              ₺{product.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

