'use client';

import React from 'react';
import LegalLayout from '@/components/legal/LegalLayout';
import { 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Server, 
  Eye, 
  UserCheck, 
  Send, 
  FileCheck, 
  HelpCircle,
  Building2
} from 'lucide-react';

export default function GizlilikPolitikasiKVKKPage() {
  return (
    <LegalLayout
      title="Gizlilik Politikası ve KVKK Aydınlatma Metni"
      subtitle="6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metni, yapay zekâ veri işleme ve gizlilik ilkelerimiz."
      badge="KVKK ve ETK Uyumlu"
      lastUpdated="Ekim 2026"
    >
      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-8">

        {/* Özet Vurgu Kutusu */}
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 not-prose space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Türkiye Veri Merkezi & Tam İzolasyon Güvencesi</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Sigorta Cüzdanı platformundaki tüm veriler Türkiye sınırları içerisindeki yüksek güvenlikli veri merkezlerinde saklanmakta; çok kiracılı (tenant-isolated) mimarimiz sayesinde hiçbir acentenin portföy ve müşteri verisi başka bir kullanıcı veya üçüncü taraf sigorta şirketiyle kesinlikle paylaşılmamaktadır.
          </p>
        </div>

        {/* Bölüm 1: Veri Sorumlusu ve Veri İşleyen Ayrımı */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">1.</span> Veri Sorumlusu ve Veri İşleyen Sıfatları
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                Acente Hesapları Açısından: Veri Sorumlusu
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Platforma üye olan sigorta acentelerinin, çalışanlarının ve yöneticilerinin kimlik, iletişim, fatura ve oturum kayıtları açısından 6698 sayılı Kanun kapsamında Veri Sorumlusu:
              </p>
              <div className="text-[11px] font-mono text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                <b>Ünvan:</b> EMRE ERCAN (Şahıs Şirketi)<br />
                <b>Vergi Dairesi:</b> Büyükçekmece V.D.<br />
                <b>VKN / TCKN:</b> 3400371057<br />
                <b>E-Posta:</b> kvkk@sigortacuzdani.net
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-600" />
                Sigortalı Müşteri Verileri Açısından: Veri İşleyen
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Acentenin sisteme yüklediği son kullanıcı (sigortalı müşteriler) kişisel verileri, poliçe dökümleri ve iletişim numaraları bakımından <b>Veri Sorumlusu Acente'nin kendisidir</b>.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sigorta Cüzdanı (EMRE ERCAN), bu verileri yalnızca acentenin talimatları doğrultusunda ve SaaS yazılım sözleşmesi çerçevesinde barındıran ve işleyen <b>“Veri İşleyen (Data Processor)”</b> konumundadır.
              </p>
            </div>
          </div>
        </section>

        {/* Bölüm 2: Insurtech & Maya Yapay Zekâ ile Veri İşleme Prensipleri */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">2.</span> Maya Yapay Zekâ Motoru ve Çapraz Satış Profillemesi
          </h2>
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 not-prose">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Cpu className="w-4 h-4 text-amber-600" />
              <span>Yapay Zekâ Analiz Kapsamı ve İnsan Denetimi İlkesi:</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              <b>2.1. Amaç:</b> Platform bünyesindeki Maya Yapay Zekâ modülü, acentenin portföyündeki verileri tarayarak; yaklaşan yenileme tarihlerini tespit etmek, poliçe kaybı (churn) riski taşıyan müşterileri belirlemek ve Tamamlayıcı Sağlık (TSS), Kasko veya DASK gibi ek teminat ihtiyaçlarını davranışsal olarak modellemek üzere veri profillemesi yapar.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <b>2.2. İnsan Onayı ve Karar Yetkisi:</b> Maya, nihai kararı tek başına vermez ve otomatik olarak poliçe kesmez. Tespit edilen çapraz satış fırsatları için öneri mesajları hazırlar ve bu mesajlar yalnızca <b>acentenin panelden veya WhatsApp üzerinden onay vermesi halinde</b> iletilir.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <b>2.3. Model İzolasyonu:</b> Acentenizin verileri, kamuya açık yapay zekâ modellerinin genel eğitimi amacıyla kullanılmaz veya üçüncü şahıslara transfer edilmez. Tüm algoritmik analizler yalnızca acentenizin lisanslı çalışma alanında geçerlidir.
            </p>
          </div>
        </section>

        {/* Bölüm 3: İşlenen Veri Kategorileri ve Toplama Yöntemleri */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">3.</span> İşlenen Kişisel Veri Kategorileri
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <b>Kimlik Bilgileri:</b> Acente yetkilisinin ve portföydeki sigortalıların Adı, Soyadı, TCKN/VKN bilgisi.
            </li>
            <li>
              <b>İletişim Bilgileri:</b> Telefon numarası (WhatsApp bildirimleri için), e-posta adresi, iş ve ikamet adresleri.
            </li>
            <li>
              <b>Poliçe ve Sigorta Bilgileri:</b> Poliçe numarası, sigorta şirketi, ürün tipi (Trafik, Kasko, DASK, TSS vb.), teminat tutarı, prim bedeli, başlangıç ve bitiş vadesi.
            </li>
            <li>
              <b>İşlem ve Kullanım Güvenliği Verileri:</b> IP adresleri, kullanıcı giriş logları, API istekleri ve oturum hareketleri.
            </li>
          </ul>
        </section>

        {/* Bölüm 4: Veri İşlemenin Hukuki Sebepleri */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">4.</span> Veri İşlemenin Hukuki Sebepleri (KVKK Madde 5)
          </h2>
          <p>
            Kişisel verileriniz, 6698 sayılı Kanun’un 5. maddesinde yer alan aşağıdaki şartlara dayanılarak işlenmektedir:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması (SaaS aboneliği hizmeti sunulması).</li>
            <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması (Vergi Usul Kanunu, TTK fatura ve kayıt yükümlülükleri).</li>
            <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması (Sistem güvenliği, hata giderme ve yapay zeka optimizasyonu).</li>
          </ul>
        </section>

        {/* Bölüm 5: Ticari Elektronik İleti ve İYS Uyarısı */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">5.</span> Ticari Elektronik İletiler ve İYS Bildirimi
          </h2>
          <p>
            Platform üzerinden sigortalı müşterilere iletilen poliçe hatırlatma, yenileme veya çapraz satış mesajları, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında değerlendirilir.
          </p>
          <p>
            Acente; WhatsApp Business veya SMS altyapısıyla müşterisine göndereceği bu mesajlar için son kullanıcının açık rızasını almış olduğunu ve İleti Yönetim Sistemi (İYS) kayıtlarını eksiksiz tuttuğunu garanti eder. Sigorta Cüzdanı, teknik iletim kanalı sunmakta olup son kullanıcı rızalarının denetlenmesinden sorumlu tutulamaz.
          </p>
        </section>

        {/* Bölüm 6: Veri Güvenliği ve Altyapı Tedbirleri */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">6.</span> Veri Güvenliği ve Altyapı Tedbirleri
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><b>Şifreleme:</b> Tüm veri transferleri 256-bit SSL/TLS sertifikalarıyla şifrelenir; veri tabanında tutulan hassas kayıtlar at-rest şifreleme ile korunur.</li>
            <li><b>Erişim Kısıtlaması:</b> Her acentenin verisi tenant kimliği ile mantıksal olarak birbirinden tamamen yalıtılmıştır.</li>
            <li><b>Yedeklilik ve Denetim:</b> Günlük şifreli veri yedekleri alınmakta ve yetkisiz erişim denemeleri anlık güvenlik duvarlarıyla engellenmektedir.</li>
          </ul>
        </section>

        {/* Bölüm 7: İlgili Kişinin Hakları ve Başvuru (KVKK Madde 11) */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <span className="text-amber-600 font-mono">7.</span> İlgili Kişi Olarak Haklarınız ve Başvuru Usulü
          </h2>
          <p>
            KVKK’nın 11. maddesi uyarınca herkes; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, eksik veya yanlış işlenmişse bunların düzeltilmesini isteme, kanuni şartlar çerçevesinde silinmesini talep etme haklarına sahiptir.
          </p>
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 not-prose space-y-2 mt-2">
            <span className="text-xs font-bold text-slate-900 block font-mono">
              Başvuru Kanalları:
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Haklarınıza ilişkin taleplerinizi kimliğinizi teyit eden belgelerle birlikte;
            </p>
            <ul className="text-xs text-slate-700 space-y-1 pl-1">
              <li>• <b>E-Posta:</b> <a href="mailto:kvkk@sigortacuzdani.net" className="text-amber-700 font-semibold underline">kvkk@sigortacuzdani.net</a> (Kayıtlı e-postanız üzerinden)</li>
              <li>• <b>Posta / Şahsen:</b> Adnan Kahveci Mah. Ayfer Sok. No:15 Daire:8 Beylikdüzü / İstanbul adresine yazılı dilekçe ile iletebilirsiniz.</li>
            </ul>
            <p className="text-[11px] text-slate-500 pt-1">
              Başvurularınız, mevzuat gereği en geç 30 (otuz) gün içerisinde ücretsiz olarak sonuçlandırılacaktır.
            </p>
          </div>
        </section>

      </div>
    </LegalLayout>
  );
}
