/** @format */
"use client";

import React from "react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingState({ 
  message = "Yükleniyor...", 
  size = "md" 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
      <div className="relative">
        {/* Outer spinning ring */}
        <div
          className={`${sizeClasses[size]} border-4 border-gray-700 border-t-yellow-400 rounded-full animate-spin`}
        ></div>
        
        {/* Inner pulsing circle */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
            size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-8 h-8"
          } bg-yellow-400 rounded-full animate-pulse`}
        ></div>
      </div>

      <p className={`mt-4 text-gray-300 ${textSizeClasses[size]} font-medium animate-pulse`}>
        {message}
      </p>

      {/* Loading dots animation */}
      <div className="flex space-x-1 mt-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

