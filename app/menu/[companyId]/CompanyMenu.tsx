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

  const filteredCategories = selectedCategory 
    ? categories.filter(cat => cat.id.toString() === selectedCategory)
    : categories;

  const toggleDescription = (productId: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Register Banner - İnce Mor Tasarım */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Reloya ile harcadıkça kazan</span>
            </div>
            <Link 
              href="/register"
              className="bg-white text-purple-600 px-3 py-1.5 rounded-md text-sm font-bold hover:bg-purple-50 transition-colors"
            >
              Üye Ol
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            {company.name}
          </h1>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories Sidebar - Mobile: Horizontal Scroll, Desktop: Vertical */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Kategoriler</h2>
              
              {/* Mobile: Horizontal Scroll */}
              <div className="lg:hidden">
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === null
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white/70 backdrop-blur-sm text-gray-700 border border-white/50 hover:bg-white/80 hover:shadow-sm"
                    }`}
                  >
                    Tümü
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id.toString())}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id.toString()
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white/70 backdrop-blur-sm text-gray-700 border border-white/50 hover:bg-white/80 hover:shadow-sm"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop: Vertical List */}
              <div className="hidden lg:block">
                <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                      selectedCategory === null
                        ? "bg-blue-600 text-white font-medium shadow-md"
                        : "bg-white/70 backdrop-blur-sm text-gray-700 border border-white/50 hover:bg-white/80 hover:shadow-sm"
                    }`}
                  >
                    Tümü
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id.toString())}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                        selectedCategory === category.id.toString()
                          ? "bg-blue-600 text-white font-medium shadow-md"
                          : "bg-white/70 backdrop-blur-sm text-gray-700 border border-white/50 hover:bg-white/80 hover:shadow-sm"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {filteredCategories.map((category) =>
                category.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden hover:shadow-lg hover:bg-white/80 transition-all duration-300"
                  >
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <div className="mb-4">
                          <p className={`text-gray-600 text-sm sm:text-base leading-relaxed ${
                            expandedDescriptions[product.id] ? '' : 'line-clamp-2'
                          }`}>
                            {product.description}
                          </p>
                          {product.description.length > 100 && (
                            <button
                              onClick={() => toggleDescription(product.id)}
                              className="text-blue-600 text-sm font-medium mt-2 flex items-center hover:text-blue-700 transition-colors"
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
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                          ₺{product.price.toFixed(2)}
                        </div>
                      </div>

                      {/* Mini Reloya Reklamı */}
                    
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredCategories.every(cat => cat.products.length === 0) && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  Bu kategoride henüz ürün bulunmuyor
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
