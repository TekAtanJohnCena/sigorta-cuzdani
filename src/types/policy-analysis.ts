// ============================================
// Poliçe "Gizli Mayın" Analiz Tipleri
// POST /api/analyze-policy endpoint'i için
// ============================================

/**
 * Risk uyarısının şiddet seviyesi.
 * - CRITICAL: Şirketi büyük finansal kayba uğratabilecek durumlar
 * - WARNING: Dikkat edilmeli, müzakere ile iyileştirilebilir
 * - INFO: Bilgilendirme amaçlı, acil risk içermiyor
 */
export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";

/**
 * Poliçede tespit edilen tek bir risk uyarısı.
 */
export interface RiskAlert {
  /** Benzersiz kimlik — React key olarak kullanılabilir */
  id: string;

  /** Kısa, net başlık — örn: "Deprem İstisnası Tespit Edildi" */
  title: string;

  /**
   * Riskin ne olduğu ve finansal olarak neye yol açabileceğini
   * CFO'nun anlayacağı dilde açıklayan metin.
   */
  description: string;

  /** Risk şiddet seviyesi */
  severity: AlertSeverity;

  /**
   * Varsa sayısal/oransal finansal etki.
   * Örnekler: "%10 Tenzili Muafiyet", "₺500.000 üst limit", "48 saat bildirim zorunluluğu"
   */
  financialImpact?: string;
}

/**
 * /api/analyze-policy endpoint'inden dönen başarı yanıtı.
 */
export interface AnalysisResponse {
  isSuccess: true;
  alerts: RiskAlert[];
  /** Poliçenin genel risk durumunu özetleyen 2 cümlelik CFO brifing metni */
  summary: string;
}

/**
 * /api/analyze-policy endpoint'inden dönen hata yanıtı.
 */
export interface AnalysisErrorResponse {
  isSuccess: false;
  error: string;
}

/** Union type — frontend'de type narrowing için kullanılır */
export type AnalysisApiResponse = AnalysisResponse | AnalysisErrorResponse;

/**
 * Claude Haiku'dan beklenen ham JSON yapısı (id olmadan, parse için)
 */
export interface RawAlertFromLLM {
  title: string;
  description: string;
  severity: AlertSeverity;
  financialImpact?: string;
}

export interface RawAnalysisFromLLM {
  alerts: RawAlertFromLLM[];
  summary: string;
}
