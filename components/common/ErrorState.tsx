/** @format */
"use client";

import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorState({
  message = "Veriler yüklenemedi",
  onRetry,
  showRetry = true,
}: ErrorStateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-500/20 rounded-full p-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-bold text-red-400 mb-2">Hata Oluştu</h2>
        <p className="text-gray-300 mb-6">{message}</p>

        {/* Retry Button */}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mx-auto group"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Tekrar Dene</span>
          </button>
        )}

        {/* Help text */}
        <p className="text-xs text-gray-500 mt-4">
          Sorun devam ederse lütfen destek ekibiyle iletişime geçin.
        </p>
      </div>
    </div>
  );
}

