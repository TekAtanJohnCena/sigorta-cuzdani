'use client';

import React, { useState } from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function IletisimPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <LegalLayout
      title="İletişim & Şirket Bilgileri"
      subtitle="Sigorta Cüzdanı ve Maya AI operasyon merkezi ile iletişime geçin. Resmi kurumsal bilgiler ve destek kanalları."
      badge="Resmi Bilgilendirme"
      lastUpdated="Ekim 2026"
    >
      <div className="space-y-10">

        {/* Kurumsal Bilgiler Kartı */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Resmi Şirket & Fatura Bilgileri
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block font-mono">
                Ticari Ünvan
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                EMRE ERCAN
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Şahıs Şirketi (Sigorta Cüzdanı Hizmet Sağlayıcısı)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block font-mono">
                Vergi Dairesi & No
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                Büyükçekmece V.D.
              </p>
              <p className="text-xs text-slate-700 font-mono mt-0.5">
                VKN / TCKN: 3400371057
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block font-mono">
                İş Adresi
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-1 leading-relaxed">
                Adnan Kahveci Mah. Ayfer Sok. No:15 Daire:8 Beylikdüzü / İstanbul
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block font-mono">
                Çalışma Saatleri
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 inline" />
                Hafta içi 09:00 - 18:00
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Cumartesi - Pazar: Yalnızca Acil Destek & Maya Otomasyonu
              </p>
            </div>
          </div>
        </section>

        {/* Hızlı İletişim ve E-posta Kanalları */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Mail className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Doğrudan İletişim Kanalları
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a 
              href="tel:05376812840" 
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition group flex flex-col justify-between"
            >
              <div>
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-xs text-slate-500 font-medium font-mono uppercase">Müşteri Destek & Satış</h3>
                <p className="text-sm font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition">
                  0537 681 28 40
                </p>
              </div>
              <span className="text-[11px] text-slate-400 mt-3 block">Arama ve WhatsApp</span>
            </a>

            <a 
              href="mailto:support@sigortacuzdani.net" 
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition group flex flex-col justify-between"
            >
              <div>
                <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="text-xs text-slate-500 font-medium font-mono uppercase">Teknik Destek</h3>
                <p className="text-sm font-bold text-slate-900 mt-1 group-hover:text-amber-600 transition truncate">
                  support@sigortacuzdani.net
                </p>
              </div>
              <span className="text-[11px] text-slate-400 mt-3 block">7/24 Bilet Sistemi</span>
            </a>

            <a 
              href="mailto:info@sigortacuzdani.net" 
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition group flex flex-col justify-between"
            >
              <div>
                <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs text-slate-500 font-medium font-mono uppercase">Kurumsal & İş Ortaklığı</h3>
                <p className="text-sm font-bold text-slate-900 mt-1 group-hover:text-emerald-600 transition truncate">
                  info@sigortacuzdani.net
                </p>
              </div>
              <span className="text-[11px] text-slate-400 mt-3 block">Resmi Yazışmalar</span>
            </a>
          </div>
        </section>

        {/* İletişim Formu */}
        <section className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Bize Mesaj Gönderin
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            Acenteniz için özel demo talepleri, Maya AI entegrasyonu veya sorularınız için aşağıdaki formu doldurabilirsiniz. Ekibimiz ortalama 2 saat içerisinde size dönüş sağlayacaktır.
          </p>

          {formSubmitted ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-950">
                Mesajınız Başarıyla İletildi!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Talebiniz ekibimize ulaştı. Belirttiğiniz iletişim kanalı üzerinden en kısa sürede sizinle iletişime geçeceğiz.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-3 text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
              >
                Yeni bir mesaj gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-mono">
                    Adınız & Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-mono">
                    Acente Adı / Şirket
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Yılmaz Sigorta Acenteliği"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-mono">
                    E-Posta Adresiniz *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ahmet@sigorta.com"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-mono">
                    Telefon Numaranız *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0532 000 00 00"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-mono">
                  Konu
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="">Seçiniz...</option>
                  <option value="demo">Demo ve Tanıtım Talebi</option>
                  <option value="maya">Maya AI & WhatsApp Entegrasyonu</option>
                  <option value="fiyat">Abonelik & Fiyatlandırma</option>
                  <option value="teknik">Teknik Destek</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-mono">
                  Mesajınız *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Mesajınızı detaylı şekilde yazınız..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Mesajı Gönder</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </section>

        {/* KVKK Bilgilendirmesi Notu */}
        <div className="p-4 rounded-xl bg-slate-100/70 text-slate-600 text-xs flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Bu form aracılığıyla paylaştığınız kimlik ve iletişim bilgileri, yalnızca talebinize cevap vermek amacıyla 6698 sayılı KVKK kapsamında işlenmektedir. Detaylı bilgi için <a href="/gizlilik-politikasi-kvkk" className="text-amber-700 font-semibold underline">Gizlilik Politikamızı (KVKK)</a> inceleyebilirsiniz.
          </p>
        </div>

      </div>
    </LegalLayout>
  );
}
