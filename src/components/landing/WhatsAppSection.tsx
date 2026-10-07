'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  CheckCheck, 
  Phone, 
  Video, 
  ArrowLeft, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  MessageCircle, 
  CheckCircle2,
  PhoneCall,
  Bot,
  ShieldCheck
} from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';

export const WhatsAppSection: React.FC = () => {
  const [activeAction, setActiveAction] = useState<string | null>('hepsine');

  return (
    <section id="maya-whatsapp" className="py-24 sm:py-32 relative bg-[#F8FAFC] border-y border-slate-100 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/50 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/50 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm mb-6">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-mono text-[11px] uppercase tracking-wider">PROAKTİF WHATSAPP AGENT</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display mb-6">
            WhatsApp&apos;tan Yönetilen <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-700 bg-clip-text text-transparent">
              Yeni Nesil Acente Deneyimi
            </span>
          </h2>

          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Sektördeki diğer CRM'ler sizden saatlerce veri girişi yapmanızı ister. 
            Maya ise günlük operasyonu WhatsApp üzerinden proaktif olarak önünüze getirir.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto mt-12">
          
          {/* Right Column: Mobile Device Mockup (Moved to left visually in grid, spans 5) */}
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
            <motion.div 
              className="w-full max-w-[340px] rounded-[3rem] bg-slate-900 p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] relative border-4 border-slate-800 transform-style-3d group"
              initial={{ opacity: 0, rotateY: -15, x: -30 }}
              whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Screen */}
              <div className="w-full rounded-[2.5rem] bg-[#efeae2] overflow-hidden flex flex-col h-[600px] relative">
                
                {/* WhatsApp Top Bar */}
                <div className="bg-[#005c4b] text-white px-4 pt-5 pb-3 flex items-center justify-between shadow-md z-20">
                  <div className="flex items-center gap-3">
                    <ArrowLeft className="w-4 h-4 text-white/90" />
                    <div className="relative">
                      <MayaAvatar size="xs" showStatus={true} showGlow={false} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1">
                        MAYA (Yapay Zeka)
                      </span>
                      <span className="text-[10px] text-emerald-100">
                        çevrimiçi • Sigorta Asistanınız
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <Video className="w-4 h-4" />
                    <Phone className="w-4 h-4" />
                  </div>
                </div>

                {/* Chat Flow */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans text-xs pb-10">
                  
                  <div className="text-center my-2">
                    <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 shadow-sm">
                      BUGÜN
                    </span>
                  </div>

                  {/* 1. Maya Message */}
                  <motion.div 
                    className="flex flex-col items-start"
                    initial={{ opacity: 0, scale: 0.9, transformOrigin: 'left bottom' }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="max-w-[92%] bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm text-slate-800 leading-relaxed border border-slate-100">
                      <div className="font-bold text-violet-700 text-[10px] mb-1 flex items-center gap-1 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-violet-600" />
                        Portföy Brifingi
                      </div>
                      <p>
                        &quot;Emre Bey, bugün <b>7 müşterimizin</b> yenileme vadesi yaklaşıyor. Teklifleri hazırladım. Göndereyim mi?&quot;
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        <span>09:14</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    </div>

                    {/* UI Element: Agent Buttons */}
                    <div className="w-[92%] mt-2 space-y-1.5 pl-1">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setActiveAction('hepsine')}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-sm ${
                            activeAction === 'hepsine'
                              ? 'bg-[#005c4b] text-white ring-2 ring-emerald-600/30'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          <Check className="w-3 h-3" /> Hepsine Gönder
                        </button>
                        <button
                          onClick={() => setActiveAction('incele')}
                          className={`py-2 px-1 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 shadow-sm ${
                            activeAction === 'incele'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          İncele
                        </button>
                      </div>
                      {activeAction === 'hepsine' && (
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 text-[9px] font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Onaylandı: 7 müşteriye link iletildi.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* 2. Maya Message (Churn) */}
                  <motion.div 
                    className="flex flex-col items-start pt-2"
                    initial={{ opacity: 0, scale: 0.9, transformOrigin: 'left bottom' }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="max-w-[92%] bg-amber-50 rounded-2xl rounded-tl-sm p-3 shadow-sm border border-amber-200/60 text-slate-800">
                      <div className="font-bold text-amber-700 text-[10px] mb-1 flex items-center gap-1 uppercase tracking-wider">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Churn Riski
                      </div>
                      <p>
                        &quot;<b>Dikkat:</b> Mehmet Kaya&apos;nın yenileme yapmama (Churn) riski yüksek. Özel olarak aramanızı öneririm.&quot;
                      </p>
                      <div className="mt-2 pt-2 border-t border-amber-200/50 flex items-center justify-between">
                        <span className="text-[10px] text-amber-900 font-bold">Kasko: ₺12.450</span>
                        <a href="tel:05376812840" className="px-2 py-1 rounded bg-amber-600 text-white font-bold text-[9px] shadow-sm flex items-center gap-1">
                          <PhoneCall className="w-3 h-3" /> Hemen Ara
                        </a>
                      </div>
                    </div>
                  </motion.div>
                  
                </div>

                {/* Bottom Input Bar */}
                <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 absolute bottom-0 w-full z-20">
                  <div className="flex-1 bg-white rounded-full px-3.5 py-2 text-[11px] text-slate-400 border border-slate-200">
                    Maya&apos;ya yanıt yaz...
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#005c4b] text-white flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* Left Column: Feature Cards (Moved to right visually in grid, spans 7) */}
          <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
            
            <motion.div 
              className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Ofiste Değil misiniz? Hiç Sorun Değil.</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Maya, portföyünüzdeki tüm hareketleri tarar ve sizi sadece karar anlarında WhatsApp üzerinden bilgilendirir. Bilgisayar başında saatler geçirmeden, her yerden tek tıkla işlerinizi onaylayabilirsiniz.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Siz Onaylayın, Maya Satışı Kapatsın</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Müşterilerinize gidecek mesajlar acentenizin kurumsal kimliğiyle, teklif karşılaştırma linkleriyle hazırlanır. Gelen olumlu yanıtlar anında önünüze poliçeleşme onayı olarak düşer.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Riskli Müşterileri Önceden Görün</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Maya, geçmiş yenileme davranışlarını ve fiyat duyarlılığını ölçerek başka acenteye gitme riski yüksek olan müşterileri kırmızı bayrakla işaretler ve sizi uyarır (Churn Kalkanı).
                </p>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default WhatsAppSection;
