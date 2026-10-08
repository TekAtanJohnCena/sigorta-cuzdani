'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  CheckCheck, 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  Send, 
  MessageCircle, 
  CheckCircle2
} from 'lucide-react';
import MayaAvatar from './MayaAvatar';

export const WhatsAppSection: React.FC = () => {
  const [activeAction, setActiveAction] = useState<string | null>('hepsine');
  const [approvedPolicy, setApprovedPolicy] = useState(false);

  return (
    <section id="maya-whatsapp" className="py-24 sm:py-32 relative bg-[#f8fafc] border-y border-slate-200/80 overflow-hidden">
      {/* Hafif Arka Plan Deseni */}
      <div className="absolute inset-0 bg-dot-pattern-light opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Bölüm Başlığı */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs mb-4">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">PROAKTİF WHATSAPP AGENT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            WhatsApp'tan Yönetilen <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Yeni Nesil Acente Deneyimi
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Sektördeki diğer CRM'ler sizden saatlerce veri girişi yapmanızı ister. 
            Maya ise günlük operasyonu WhatsApp üzerinden proaktif olarak önünüze getirir.
          </p>
        </div>

        {/* İki Kolonlu Yerleşim */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Mobil Cihaz Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div 
              className="w-full max-w-[390px] rounded-[2.8rem] bg-slate-900 p-3.5 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] ring-1 ring-slate-800 relative"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-full rounded-[2.2rem] bg-[#efeae2] overflow-hidden flex flex-col h-[650px] relative">
                
                {/* WhatsApp Üst Yeşil Bar */}
                <div className="bg-[#005c4b] text-white px-4 pt-4 pb-3 flex items-center justify-between shadow-md z-20">
                  <div className="flex items-center gap-2.5">
                    <ArrowLeft className="w-4 h-4 text-white/90" />
                    
                    <div className="relative">
                      <MayaAvatar size="sm" showStatus={true} showGlow={false} />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1">
                        MAYA 🐝 (Akıllı Asistan)
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      </span>
                      <span className="text-[10px] text-emerald-200">
                        çevrimiçi • Sigorta Asistanınız
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/90">
                    <Video className="w-4 h-4" />
                    <Phone className="w-4 h-4" />
                    <MoreVertical className="w-4 h-4" />
                  </div>
                </div>

                {/* Sohbet Akışı */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 font-sans text-xs">
                  <div className="text-center my-1">
                    <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-semibold text-slate-600 shadow-xs">
                      BUGÜN
                    </span>
                  </div>

                  {/* 1. Maya Mesajı */}
                  <motion.div 
                    className="flex flex-col items-start"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-xs border border-slate-100 text-slate-800 leading-relaxed">
                      <div className="font-bold text-amber-700 text-[11px] mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Maya • Sabah Portföy Brifingi
                      </div>
                      <p>
                        "Emre Bey, bugün <b>7 müşterimizin</b> yenileme vadesi yaklaşıyor. Özel tekliflerini ve hatırlatma mesajlarını hazırladım. Göndereyim mi?"
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        <span>09:14</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    </div>

                    <div className="w-[90%] mt-2 space-y-1.5 pl-1">
                      <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                        <span>Acente Onay Seçenekleri:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => setActiveAction('hepsine')}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                            activeAction === 'hepsine'
                              ? 'bg-[#005c4b] text-white ring-2 ring-emerald-600'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          Hepsine Gönder
                        </button>

                        <button
                          onClick={() => setActiveAction('incele')}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                            activeAction === 'incele'
                              ? 'bg-blue-600 text-white ring-2 ring-blue-700'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                          }`}
                        >
                          Detaylı İncele
                        </button>

                        <button
                          onClick={() => setActiveAction('hayir')}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                            activeAction === 'hayir'
                              ? 'bg-rose-600 text-white'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                          }`}
                        >
                          Hayır
                        </button>
                      </div>

                      {activeAction === 'hepsine' && (
                        <div className="p-2 rounded-lg bg-emerald-100/90 text-emerald-800 text-[10px] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Onaylandı: 7 müşteriye kişiselleştirilmiş teklif linki WhatsApp iletildi.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* 2. Maya Mesajı */}
                  <motion.div 
                    className="flex flex-col items-start pt-1"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <div className="max-w-[90%] bg-amber-50/95 rounded-2xl rounded-tl-sm p-3.5 shadow-xs border border-amber-200 text-slate-800 leading-relaxed">
                      <div className="font-bold text-amber-800 text-[11px] mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Kayıp (Churn) Riski Uyarısı
                      </div>
                      <p className="text-slate-800">
                        "<b>Dikkat:</b> Mehmet Kaya'nın kasko yenilemesini bu yıl yapmama ihtimali (Churn) yüksek görünüyor. Kendisini özel olarak aramanızı öneririm."
                      </p>
                      <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-amber-900 font-bold">Kasko: ₺12.450</span>
                        <a 
                          href="tel:05320000000"
                          className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px] hover:bg-amber-700"
                        >
                          📞 Hemen Ara
                        </a>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        <span>09:16</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    </div>
                  </motion.div>

                  {/* 3. Maya Mesajı */}
                  <motion.div 
                    className="flex flex-col items-start pt-1"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-xs border border-slate-100 text-slate-800 leading-relaxed">
                      <div className="font-bold text-emerald-700 text-[11px] mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Çapraz Satış Yanıtı (DASK)
                      </div>
                      <p>
                        "Ayşe Yılmaz gönderdiğim çapraz satış (DASK) mesajına cevap verdi. Teklif dosyasını iletiyorum, onaylarsanız poliçeleşme sürecini başlatacağım."
                      </p>
                      
                      <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[10px]">DASK_Teklif_AyseYilmaz.pdf</div>
                            <div className="text-[9px] text-slate-500">Prim: ₺890 • Anadolu Sigorta</div>
                          </div>
                        </div>

                        <button
                          onClick={() => setApprovedPolicy(true)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                            approvedPolicy
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {approvedPolicy ? '✓ Onaylandı' : 'Poliçeleştir'}
                        </button>
                      </div>

                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        <span>09:21</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    </div>
                  </motion.div>

                </div>

                {/* Alt Yazma Çubuğu */}
                <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200/80">
                  <div className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-[11px] text-slate-400 border border-slate-200">
                    Maya'ya yanıt yaz veya "Evet" de...
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#005c4b] text-white flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* Sağ Kolon: Açıklama Kartları ve Hover Animasyonları */}
          <div className="lg:col-span-6 space-y-5">
            {/* Kart 1: 📱 Ofiste Değil misiniz? */}
            <motion.div 
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.015 }}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mb-4 shadow-xs transition-transform duration-300 group-hover:scale-115 group-hover:-rotate-6">
                  📱
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 opacity-80 group-hover:opacity-100 transition">
                  MOBİL ÖZGÜRLÜK
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-950 transition">
                Ofiste Değil misiniz? Hiç Sorun Değil.
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Maya, portföyünüzdeki tüm hareketleri tarar ve sizi sadece karar anlarında WhatsApp üzerinden bilgilendirir. 
                Bilgisayar başında saatler geçirmeden, arabada veya toplantıdayken tek tıkla işlerinizi onaylayabilirsiniz.
              </p>
            </motion.div>

            {/* Kart 2: 🤖 Siz Onaylayın, Maya Satışı Kapatsın */}
            <motion.div 
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6, scale: 1.015 }}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold mb-4 shadow-xs transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6">
                  🤖
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 opacity-80 group-hover:opacity-100 transition">
                  OTONOM SATIŞ
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-950 transition">
                Siz Onaylayın, Maya Satışı Kapatsın
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Müşterilerinize gidecek mesajlar acentenizin kurumsal kimliğiyle, teklif karşılaştırma linkleriyle hazırlanır. 
                Gelen olumlu yanıtlar anında önünüze poliçeleşme onayı olarak düşer.
              </p>
            </motion.div>

            {/* Kart 3: ⚠️ Riskli Müşterileri Önceden Görün (Churn Kalkanı) */}
            <motion.div 
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6, scale: 1.015 }}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl font-bold mb-4 shadow-xs transition-transform duration-300 group-hover:scale-115 group-hover:-rotate-6">
                  ⚠️
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 opacity-80 group-hover:opacity-100 transition">
                  CHURN KALKANI
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-950 transition">
                Riskli Müşterileri Önceden Görün (Churn Kalkanı)
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Maya, geçmiş yenileme davranışlarını ve fiyat duyarlılığını ölçerek başka acenteye gitme riski yüksek olan müşterileri kırmızı bayrakla işaretler ve sizi uyarır.
              </p>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default WhatsAppSection;
