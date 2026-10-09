'use client';

import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  CreditCard,
  Send
} from 'lucide-react';

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <LegalLayout
      title="Mesafeli Satış Sözleşmesi"
      subtitle="Sigorta Cüzdanı platformu SaaS lisans aboneliği ve hizmet şartlarına ilişkin mesafeli sözleşme metni."
      badge="Resmi Hukuki Sözleşme"
      lastUpdated="Ekim 2026"
    >
      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-8">

        {/* Başlangıç Notu */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 flex items-start gap-3 not-prose">
          <Scale className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold block">Önemli Hukuki Bilgilendirme:</span>
            <p className="text-slate-700 leading-relaxed">
              İşbu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca, Sigorta Cüzdanı platformuna elektronik ortamda abone olan bağımsız sigorta acenteleri ve tüzel/gerçek kişi kullanıcılar (“ALICI”) ile hizmet sağlayıcı (“SATICI”) arasındaki hak ve yükümlülükleri düzenler.
            </p>
          </div>
        </div>

        {/* Madde 1: Taraflar */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">1.</span> Taraflar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase block">
                SATICI (Hizmet Sağlayıcı)
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">EMRE ERCAN</p>
              <p className="text-xs text-slate-600 mt-0.5">Şahıs Şirketi (Sigorta Cüzdanı)</p>
              <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs space-y-1 text-slate-600">
                <p><b>Vergi Dairesi:</b> Büyükçekmece V.D.</p>
                <p><b>VKN / TCKN:</b> 3400371057</p>
                <p><b>Adres:</b> Adnan Kahveci Mah. Ayfer Sok. No:15 Daire:8 Beylikdüzü / İstanbul</p>
                <p><b>E-Posta:</b> support@sigortacuzdani.net / info@sigortacuzdani.net</p>
                <p><b>Telefon:</b> 0537 681 28 40</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase block">
                ALICI (Kullanıcı / Acente)
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">Platform Üyesi Acente</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Sigorta Cüzdanı platformuna kayıt olurken veya paket satın alırken beyan edilen ad, soyad, unvan, vergi kimlik numarası ve iletişim bilgilerinin sahibi gerçek veya tüzel kişidir.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-500">
                * Alıcının kayıt esnasında sağladığı e-posta ve telefon bilgileri tebligat adresi kabul edilir.
              </div>
            </div>
          </div>
        </section>

        {/* Madde 2: Sözleşmenin Konusu ve Kapsamı */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">2.</span> Sözleşmenin Konusu ve Kapsamı
          </h2>
          <p>
            İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait <a href="https://sigortacuzdani.net" className="text-amber-700 font-semibold underline">sigortacuzdani.net</a> web sitesi ve ilişkili bulut uygulamaları üzerinden elektronik ortamda siparişini verdiği; nitelikleri ve satış fiyatı belirtilen <b>Sigorta Cüzdanı SaaS (Hizmet Olarak Yazılım) Portföy Yönetim Platformu</b> ile <b>Maya Yapay Zekâ Asistanı</b> lisansının temini ve kullanım şartlarının belirlenmesidir.
          </p>
        </section>

        {/* Madde 3: Hizmet Nitelikleri ve Ücretlendirme */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">3.</span> Hizmet Paketleri, Deneme Süresi ve Ödeme
          </h2>
          <p>
            Platform iki temel abonelik modeli üzerinden kullanıma sunulmaktadır:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <b>Aylık Plan:</b> ₺2.000 / ay olarak faturalandırılır. Her ay otomatik olarak yenilenir.
            </li>
            <li>
              <b>Yıllık Plan:</b> %20 indirimle ₺1.600 / ay (Yıllık peşin tek çekim ₺19.200) olarak faturalandırılır ve 12 ay boyunca geçerlidir.
            </li>
            <li>
              <b>14 Günlük Ücretsiz Deneme (Trial):</b> ALICI, platforma ilk kaydında herhangi bir kredi kartı bilgisi girmeksizin 14 gün boyunca sistemi tüm özellikleriyle ücretsiz deneyimleme hakkına sahiptir. Deneme süresi bitiminde ücretli pakete geçilmediği takdirde hesap askıya alınır, herhangi bir otomatik borç yansıtılmaz.
            </li>
          </ul>
        </section>

        {/* Madde 4: Insurtech, Çapraz Satış ve Ticari İleti Sorumlulukları (Kritik Madde) */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">4.</span> Yapay Zekâ, Çapraz Satış ve Ticari İleti (ETK & İYS) Taahhütleri
          </h2>
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 not-prose">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Send className="w-4 h-4 text-amber-600" />
              <span>Acente Sorumluluğu & İleti Yönetim Sistemi (İYS) Beyanı:</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              <b>4.1.</b> Sigorta Cüzdanı bünyesinde yer alan <b>Maya Yapay Zekâ Motoru</b>; ALICI'nın portföyünü tarayarak yenileme vadesi yaklaşan veya tamamlayıcı sağlık (TSS), DASK, Kasko gibi çapraz satış potansiyeli yüksek olan müşterileri profilleme yoluyla tespit eder, mesaj taslakları hazırlar ve ALICI'nın onayına sunar. Maya bağımsız ve otonom olarak doğrudan poliçe düzenlemez ve ALICI onayı olmaksızın nihai satışı tamamlamaz.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <b>4.2.</b> ALICI; WhatsApp, SMS veya e-posta servisleri üzerinden son kullanıcılarına (kendi müşterilerine) göndereceği teklif, hatırlatma veya pazarlama içerikli tüm ticari iletiler için <b>6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun (ETK)</b> ve <b>İleti Yönetim Sistemi (İYS)</b> kapsamında gerekli açık rıza ve onayları almış olduğunu gayrikabili rücu kabul, beyan ve taahhüt eder.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <b>4.3.</b> SATICI (EMRE ERCAN - Sigorta Cüzdanı), 6563 sayılı Kanun uyarınca yalnızca teknik yazılım altyapısı sağlayan <i>"Aracı Hizmet Sağlayıcı"</i> konumundadır. ALICI'nın hukuka aykırı veya izinsiz ticari ileti göndermesinden doğabilecek tüm idari para cezaları, hukuki ve cezai yaptırımlar münhasıran ALICI'ya aittir.
            </p>
          </div>
        </section>

        {/* Madde 5: Cayma Hakkı ve İstisnaları */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">5.</span> Cayma Hakkı ve İstisnaları
          </h2>
          <p>
            <b>5.1.</b> Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca; <i>"Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler"</i> cayma hakkının istisnaları arasında yer almaktadır.
          </p>
          <p>
            <b>5.2.</b> Sigorta Cüzdanı SaaS lisansı anında aktifleşen ve veri senkronizasyonu sağlayan bir dijital bulut hizmeti olduğundan, abonelik ödemesi yapıldıktan sonra kural olarak cayma hakkı bulunmamaktadır. Ancak ALICI'nın mağduriyet yaşamaması adına sistem <b>14 Gün Boyunca Tamamen Ücretsiz</b> olarak test edilmeye açık tutulmaktadır.
          </p>
        </section>

        {/* Madde 6: Abonelik İptali */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">6.</span> Abonelik İptali ve Fesih
          </h2>
          <p>
            ALICI, dilediği an hesap yönetim paneli üzerinden veya <a href="mailto:support@sigortacuzdani.net" className="text-amber-700 font-semibold underline">support@sigortacuzdani.net</a> adresine bildirimde bulunarak aboneliğinin bir sonraki dönem için yenilenmesini durdurabilir. İptal talebi halinde, ödenmiş olan mevcut dönemin sonuna kadar platform erişimi kesintisiz devam eder; dönem ortasında peşin ücret iadesi yapılmaz.
          </p>
        </section>

        {/* Madde 7: Veri Güvenliği ve Mülkiyeti */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">7.</span> Veri Mülkiyeti ve Gizlilik
          </h2>
          <p>
            ALICI tarafından platforma aktarılan tüm müşteri, poliçe, hasar ve finans verileri münhasıran ALICI'nın mülkiyetindedir. SATICI, bu verileri yalnızca sözleşmede tanımlanan yapay zekâ analizleri, hatırlatmalar ve portföy CRM fonksiyonlarının işletilmesi amacıyla barındırır. Veriler üçüncü şahıslara veya sigorta şirketlerine satılamaz, devredilemez.
          </p>
        </section>

        {/* Madde 8: Uyuşmazlıkların Çözümü */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">8.</span> Yetkili Mahkeme ve İcra Daireleri
          </h2>
          <p>
            İşbu sözleşmenin uygulanmasından veya yorumlanmasından doğabilecek her türlü uyuşmazlığın çözümünde, Sanayi ve Ticaret Bakanlığı'nca ilan edilen değere kadar Tüketici Hakem Heyetleri ile <b>İstanbul Büyükçekmece Mahkemeleri ve İcra Daireleri</b> yetkilidir.
          </p>
        </section>

        {/* Yürürlük */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
          ALICI, web sitesi üzerinden abonelik işlemini onayladığı veya hizmet bedelini ödediği anda işbu sözleşmenin tüm maddelerini okumuş, anlamış ve kabul etmiş sayılır.
        </div>

      </div>
    </LegalLayout>
  );
}
