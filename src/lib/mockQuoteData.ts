// ============================================
// Mock Quote Data — Teklif Motoru Simülasyonu
// ============================================
import { PolicyType } from "@/types/policy";

export interface MockQuote {
  id: string;
  company: string;
  logo: string;
  rating: number;       // 1-5
  customerScore: number; // 0-100
  annualPremium: number;
  coverageSummary: string[];
  badge?: string;
}

export const MOCK_QUOTES_BY_TYPE: Record<string, MockQuote[]> = {
  kasko: [
    { id: "q1", company: "Allianz Sigorta", logo: "🔵", rating: 5, customerScore: 92, annualPremium: 16450, coverageSummary: ["Tam Hasar", "Hırsızlık", "Doğal Afet", "Ferdi Kaza"], badge: "En İyi Fiyat" },
    { id: "q2", company: "AXA Sigorta", logo: "🟠", rating: 4, customerScore: 88, annualPremium: 17200, coverageSummary: ["Tam Hasar", "Hırsızlık", "Doğal Afet", "Yol Yardım"] },
    { id: "q3", company: "Aksigorta", logo: "🟢", rating: 4, customerScore: 85, annualPremium: 18100, coverageSummary: ["Tam Hasar", "Hırsızlık", "Ferdi Kaza"] },
    { id: "q4", company: "Mapfre Sigorta", logo: "🔴", rating: 5, customerScore: 90, annualPremium: 16800, coverageSummary: ["Tam Hasar", "Hırsızlık", "Doğal Afet"], badge: "En Geniş Teminat" },
  ],
  yangin: [
    { id: "q1", company: "AXA Sigorta", logo: "🟠", rating: 5, customerScore: 91, annualPremium: 38500, coverageSummary: ["Yangın", "Hırsızlık", "Dahili Su", "Cam Kırılması", "İş Durması"], badge: "En İyi Fiyat" },
    { id: "q2", company: "Mapfre Sigorta", logo: "🔴", rating: 4, customerScore: 87, annualPremium: 41200, coverageSummary: ["Yangın", "Hırsızlık", "Dahili Su", "Elektrik Hasarı"] },
    { id: "q3", company: "Güneş Sigorta", logo: "🟡", rating: 4, customerScore: 83, annualPremium: 43000, coverageSummary: ["Yangın", "Hırsızlık", "Cam Kırılması"] },
  ],
  saglik: [
    { id: "q1", company: "Anadolu Sigorta", logo: "🔷", rating: 5, customerScore: 93, annualPremium: 178000, coverageSummary: ["Yatarak", "Ayakta", "Diş", "Göz", "Doğum"], badge: "En Geniş Teminat" },
    { id: "q2", company: "Aksigorta", logo: "🟢", rating: 4, customerScore: 86, annualPremium: 182000, coverageSummary: ["Yatarak", "Ayakta", "Diş"], badge: "En İyi Fiyat" },
    { id: "q3", company: "Generali Sigorta", logo: "🦁", rating: 5, customerScore: 94, annualPremium: 191000, coverageSummary: ["Yatarak", "Ayakta", "Diş", "Göz", "Psikolojik Destek"] },
  ],
  default: [
    { id: "q1", company: "Allianz Sigorta", logo: "🔵", rating: 5, customerScore: 92, annualPremium: 0, coverageSummary: ["Temel Teminat", "Genişletilmiş Kapsam"], badge: "En İyi Fiyat" },
    { id: "q2", company: "AXA Sigorta", logo: "🟠", rating: 4, customerScore: 88, annualPremium: 0, coverageSummary: ["Temel Teminat"] },
    { id: "q3", company: "Mapfre Sigorta", logo: "🔴", rating: 5, customerScore: 90, annualPremium: 0, coverageSummary: ["Temel Teminat", "Ek Kısımlar"] },
  ],
};

export const SEARCH_STEPS = [
  "🔍 Piyasadaki 15 sigorta şirketi taranıyor...",
  "⚖️ Mevcut teminat kapsamınız analiz ediliyor...",
  "💡 Eşdeğer poliçeler karşılaştırılıyor...",
  "📊 Fiyatlar güncelleniyor ve sıralanıyor...",
  "✅ En iyi 3 teklif hazırlandı!",
];

export function getQuotesForPolicy(policyType: PolicyType, currentPremium: number): MockQuote[] {
  const base = MOCK_QUOTES_BY_TYPE[policyType] || MOCK_QUOTES_BY_TYPE.default;
  // If default, scale premiums relative to currentPremium
  return base.map(q => ({
    ...q,
    annualPremium: q.annualPremium > 0
      ? q.annualPremium
      : Math.round(currentPremium * (0.82 + Math.random() * 0.25)),
  }));
}
