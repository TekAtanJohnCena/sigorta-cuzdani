'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Shield, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MayaAvatar } from './MayaAvatar';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    agencyName: '',
    fullName: '',
    phone: '',
    email: '',
    policyCount: '200-500',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      confetti({
        particleCount: 110,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-100 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-violet-100 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MayaAvatar size="sm" showStatus={true} />
              <div>
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider font-mono">
                  MAYA İLE BAŞLAYIN
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  14 Gün Ücretsiz Deneyin
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Kredi kartı gerekmez. Maya 60 saniye içinde WhatsApp hattınıza bağlanır ve portföyünüzü korumaya başlar.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Acente Adı / Unvanı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Anadolu Elit Sigorta Aracılık"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Yetkili Adı Soyadı
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Emre Yılmaz"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Telefonu
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0532 000 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İş E-Posta Adresi
                </label>
                <input
                  type="email"
                  required
                  placeholder="acente@sigortacuzdani.net"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aylık Ortalama Poliçe Adediniz
                </label>
                <select
                  value={formData.policyCount}
                  onChange={(e) => setFormData({ ...formData, policyCount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition"
                >
                  <option value="50-200">50 - 200 adet (Butik Acente)</option>
                  <option value="200-500">200 - 500 adet (Orta Ölçekli Acente)</option>
                  <option value="500-1500">500 - 1.500 adet (Büyüyen Acente)</option>
                  <option value="1500+">1.500+ adet (Şubeli / Büyük Acente)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Maya ile 14 Gün Ücretsiz Başla</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>KVKK uyumlu altyapı • Taahhüt ve kredi kartı gerekmez</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900">Harika, Maya Hazır!</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              <b>{formData.agencyName || 'Acenteniz'}</b> için 14 günlük tam erişimli hesap oluşturuldu. Maya, ilk portföy analizi ve WhatsApp bağlantı rehberini telefonunuza iletti.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Acente Hesabı:</span>
                <span className="text-slate-900 font-semibold">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Maya Asistan Durumu:</span>
                <span className="text-emerald-600 font-bold">14 Gün Aktif (Ücretsiz)</span>
              </div>
            </div>

            <a
              href="/login"
              className="block w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition text-center"
            >
              Panele Giriş Yap
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialModal;
