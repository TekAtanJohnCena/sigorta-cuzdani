"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hatayı sistem yöneticilerinin takibi için konsola yazdırıyoruz.
    console.error("[DASHBOARD_ERROR_BOUNDARY] Saptanan Hata:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-gray-100 max-w-lg w-full">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Sistemde geçici bir sorun oluştu
        </h2>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          İşleminizi şu anda gerçekleştiremiyoruz. Hata kayıt altına alınmış olup teknik ekibimiz tarafından incelenmektedir. Lütfen sayfayı yenilemeyi deneyin.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors duration-200"
          >
            Tekrar Dene
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 shadow-sm transition-colors duration-200"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-xs text-gray-400">
        Hata Kodu: {error.digest || "Bilinmiyor"} • Olay Tarihi: {new Date().toLocaleString('tr-TR')}
      </div>
    </div>
  );
}
