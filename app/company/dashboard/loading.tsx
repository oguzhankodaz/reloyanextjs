export default function Loading() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center space-y-4">
          {/* Dönen spinner */}
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          
          {/* Marka ismi */}
          <p className="text-lg font-semibold tracking-wide">ReloYa Yükleniyor...</p>
        </div>
      </div>
    );
  }
  