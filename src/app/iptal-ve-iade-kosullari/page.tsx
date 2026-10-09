'use client';

import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function IptalVeIadeKosullariPage() {
  return (
    <LegalLayout
      title="İptal ve İade Koşulları"
      subtitle="Sigorta Cüzdanı SaaS aboneliğinizin iptali, deneme süresi şartları ve iade politikamıza ilişkin kurallar."
      badge="Tüketici Hakları & İptal Politikası"
      lastUpdated="Ekim 2026"
    >
      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-8">

        {/* 14 Gün Deneme Güvencesi */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200 text-amber-950 not-prose space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <span>14 Gün Koşulsuz & Kredi Kartsız Ücretsiz Deneme</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Sigorta Cüzdanı, acentenizin platformu ve yapay zekâ asistanı Maya'yı risk almadan deneyimleyebilmesi için <b>14 günlük ücretsiz deneme hakkı</b> sunar. Kayıt olurken kredi kartı bilgisi talep edilmez. Deneme süreniz sona erdiğinde hizmeti satın almayı tercih etmezseniz hesabınız otomatik olarak pasife alınır ve hiçbir ücret kesilmez.
          </p>
        </div>

        {/* Bölüm 1: Abonelik İptali */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">1.</span> Abonelik Nasıl İptal Edilir?
          </h2>
          <p>
            Acenteler, başlattıkları ücretli abonelikleri (Aylık veya Yıllık plan) diledikleri zaman hiçbir cezai şart veya taahhüt olmaksızın iptal edebilirler:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <b>Panel Üzerinden Tek Tıkla:</b> Sigorta Cüzdanı paneline giriş yaptıktan sonra <i>Ayarlar &gt; Abonelik & Fatura</i> sekmesinden dilediğiniz an "Aboneliği Sonlandır" butonuna basarak bir sonraki dönemin yinelenmesini durdurabilirsiniz.
            </li>
            <li>
              <b>Destek E-Postası ile:</b> <a href="mailto:support@sigortacuzdani.net" className="text-amber-700 font-semibold underline">support@sigortacuzdani.net</a> adresine acente unvanınızı ve kayıtlı e-postanızı belirterek iptal talebi iletebilirsiniz. Talebiniz en geç 24 saat içinde işleme alınır.
            </li>
          </ul>
        </section>

        {/* Bölüm 2: İptal Sonrası Erişim ve Süre */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">2.</span> İptal Sonrası Hizmete Erişim
          </h2>
          <p>
            Aboneliğinizi iptal ettiğinizde, mevcut fatura döneminizin son gününe kadar (ödemesini önceden yaptığınız ayın veya yılın sonuna kadar) platformu, Maya asistanını ve tüm raporlama araçlarını tam yetkiyle kullanmaya devam edebilirsiniz. Dönem sona erdiğinde kartınızdan yeni bir çekim yapılmaz ve hesabınız güvenli arşiv moduna alınır.
          </p>
        </section>

        {/* Bölüm 3: Dijital Hizmetlerde İade Politikası */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">3.</span> Ücret İadesi (Refund) Şartları
          </h2>
          <p>
            Sigorta Cüzdanı, bulut tabanlı bir yazılım (SaaS) olup, satın alma işlemi tamamlandığı anda hizmet elektronik ortamda anında ifa edilmektedir. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca dijital ortamda anında sunulan gayrimaddi ürünlerde cayma hakkı bulunmamaktadır.
          </p>
          <p>
            Bununla birlikte, kullanıcı memnuniyetini ön planda tutan bir insurtech startup'ı olarak aşağıdaki kurallar uygulanır:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose my-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block font-mono">
                Aylık Abonelik İadeleri
              </span>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Aylık paketlerde kullanım ayı başladıktan sonra dönem ortasında geriye dönük oransal iade yapılmaz. İptal talebi bir sonraki ayın yinelenmesini engeller.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block font-mono">
                Yıllık Abonelik Güvencesi (İlk 7 Gün)
              </span>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Yıllık peşin plan satın alan acentelerimiz, teknik bir arıza veya altyapı uyumsuzluğu nedeniyle platformu kullanamadıkları takdirde, satın alma tarihinden itibaren ilk 7 gün içinde yazılı başvuruda bulunurlarsa kesintisiz tam iade hakkına sahiptir.
              </p>
            </div>
          </div>
        </section>

        {/* Bölüm 4: İade Süreci ve Banka Yansımaları */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">4.</span> İadenin Hesaba Yansıma Süresi
          </h2>
          <p>
            Onaylanan iadeler, ödemenin tahsil edildiği kredi kartı veya banka hesabına derhal iade emri olarak gönderilir. Bankanızın takas ve hesap kesim süreçlerine bağlı olarak tutarın ekstrenize yansıması <b>3 ile 7 iş günü</b> arasında sürebilmektedir.
          </p>
        </section>

        {/* Bölüm 5: Müşteri Verilerinin Dışa Aktarımı (Export) */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">5.</span> İptal Halinde Verileriniz
          </h2>
          <p>
            Aboneliğinizi sonlandırsanız dahi, platforma yüklemiş olduğunuz müşteri ve poliçe kayıtlarınızı dilediğiniz an Excel / CSV formatında tek tıkla dışa aktarabilirsiniz. Verileriniz, yasal saklama süreleri haricinde talep etmeniz halinde 30 gün içinde sistemlerimizden kalıcı olarak silinir.
          </p>
        </section>

        {/* İletişim Notu */}
        <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 not-prose">
          <div>
            <span className="font-bold text-slate-900 block">İptal veya iade konusunda yardıma mı ihtiyacınız var?</span>
            <span className="text-slate-600">Destek ekibimiz hafta içi her gün sorularınızı yanıtlamaktan mutluluk duyar.</span>
          </div>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 transition shrink-0"
          >
            <span>Destek Ekibine Ulaşın</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          </Link>
        </div>

      </div>
    </LegalLayout>
  );
}
