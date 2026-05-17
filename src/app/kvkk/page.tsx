import Link from "next/link";

export const metadata = {
  title: "KVKK Politikası | Sigorta Cüzdanı",
  description: "Kişisel Verilerin Korunması ve İşlenmesi Politikası",
};

export default function KVKKPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--background)",
      padding: "var(--space-8) var(--space-4)",
    }}>
      <article style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: "white",
        padding: "var(--space-8)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        lineHeight: 1.8,
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)", paddingBottom: "var(--space-6)", borderBottom: "2px solid var(--border-light)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="url(#kvkkLogoGrad)" />
              <path d="M16 7L9 10V17C9 20.87 12.13 24.5 16 25C19.87 24.5 23 20.87 23 17V10L16 7Z" fill="white" fillOpacity="0.9" />
              <path d="M13 16.5L15 18.5L19 14.5" stroke="url(#kvkkLogoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="kvkkLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5A75F5" />
                  <stop offset="1" stopColor="#14B8A6" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-600)" }}>Sigorta Cüzdanı</span>
          </div>
          <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
            Kişisel Verilerin Korunması ve İşlenmesi Politikası
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
          </p>
        </div>

        {/* Content Sections */}
        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            1. Veri Sorumlusu
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Sigorta Cüzdanı platformu olarak kişisel verilerinizin korunmasına önem veriyoruz.
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verilerinizin
            veri sorumlusu sıfatıyla işlenmesinden Sigorta Cüzdanı A.Ş. sorumludur.
          </p>
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            2. İşlenen Kişisel Veriler
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Platformumuz üzerinden aşağıdaki kişisel verileriniz işlenmektedir:
          </p>
          <ul style={{ paddingLeft: "var(--space-6)", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>İletişim Bilgileri:</strong> Telefon numarası, iş adresi
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Sigorta Poliçe Bilgileri:</strong> Poliçe numarası, teminat detayları, prim tutarları, vade tarihleri
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Şirket Bilgileri:</strong> Ticari unvan, vergi numarası, şirket yetkilisi bilgileri
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Platform Kullanım Verileri:</strong> IP adresi, oturum bilgileri, erişim logları
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            3. Kişisel Verilerin İşlenme Amaçları
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
          </p>
          <ul style={{ paddingLeft: "var(--space-6)", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Sigorta portföy yönetimi hizmetinin sunulması
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Poliçe vade takibi ve bildirim gönderimi
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Risk analizi ve raporlama hizmetlerinin sunulması
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Hasar yönetimi ve takip işlemlerinin gerçekleştirilmesi
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Müşteri ilişkileri yönetimi ve iletişim faaliyetleri
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Yasal yükümlülüklerin yerine getirilmesi
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Platform güvenliğinin sağlanması ve teknik destek hizmetlerinin verilmesi
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            4. Kişisel Verilerin İşlenme Hukuki Sebepleri
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:
          </p>
          <ul style={{ paddingLeft: "var(--space-6)", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Hizmet sözleşmesinin kurulması veya ifası için gerekli olması
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            5. Veri Güvenliği Tedbirleri
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Kişisel verilerinizin güvenliğini sağlamak için aşağıdaki teknik ve idari tedbirleri almaktayız:
          </p>
          <ul style={{ paddingLeft: "var(--space-6)", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Şifreleme:</strong> Tüm veriler Firebase altyapısında şifreli olarak saklanır
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Tenant İzolasyonu:</strong> Her müşterinin verileri tenant-based mimari ile birbirinden izole edilir
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>İletim Güvenliği:</strong> SSL/TLS protokolleri ile güvenli veri iletimi sağlanır
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Erişim Kontrolü:</strong> Rol tabanlı yetkilendirme sistemi ile veri erişimi kontrol edilir
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Güvenlik Denetimleri:</strong> Düzenli penetrasyon testleri ve güvenlik denetimleri yapılır
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Erişim Logları:</strong> Tüm veri erişimleri kayıt altına alınır ve izlenir
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Yedekleme:</strong> Düzenli veri yedekleme prosedürleri uygulanır
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            6. Kişisel Verilerin Aktarılması
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda ve KVKK'da öngörülen
            güvenlik tedbirleri çerçevesinde aşağıdaki taraflara aktarılabilir:
          </p>
          <ul style={{ paddingLeft: "var(--space-6)", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Hizmet sağlayıcılarımız (bulut hizmet sağlayıcıları, e-posta servisleri)
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Yasal yükümlülükler gereği kamu kurum ve kuruluşları
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Teknik destek ve bakım hizmeti veren iş ortaklarımız
            </li>
          </ul>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Verileriniz yurt dışına aktarılması durumunda KVKK'nın 9. maddesinde öngörülen şartlara uygun hareket edilir.
          </p>
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            7. Kişisel Verilerin Saklama Süresi
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama yükümlülüklerine uygun olarak saklanır:
          </p>
          <ul style={{ paddingLeft: "var(--space-6)", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Aktif Kullanıcı Verileri:</strong> Hesap aktif olduğu sürece
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Sigorta Poliçe Verileri:</strong> Poliçe sona erdikten sonra 10 yıl (Türk Ticaret Kanunu ve ilgili mevzuat gereği)
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>İşlem Kayıtları ve Loglar:</strong> 2 yıl
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              <strong>Finansal Kayıtlar:</strong> 10 yıl (Vergi Usul Kanunu gereği)
            </li>
          </ul>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Saklama süresinin sona ermesi durumunda verileriniz KVKK ve ilgili mevzuata uygun şekilde silinir, yok edilir veya anonim hale getirilir.
          </p>
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            8. KVKK Kapsamındaki Haklarınız
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
          </p>
          <ul style={{ paddingLeft: "var(--space-6)", color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Kişisel verilerinizin işlenip işlenmediğini öğrenme
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Düzeltme, silme veya yok edilme işlemlerinin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonuç doğması halinde buna itiraz etme
            </li>
            <li style={{ marginBottom: "var(--space-2)" }}>
              Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            9. Başvuru Yöntemi
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Yukarıda belirtilen haklarınızı kullanmak için başvurunuzu aşağıdaki yöntemlerle bize iletebilirsiniz:
          </p>
          <div style={{
            background: "var(--primary-50)",
            border: "2px solid var(--primary-200)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-4)",
            marginBottom: "var(--space-3)"
          }}>
            <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>
              <strong>E-posta:</strong> <a href="mailto:kvkk@sigortacuzdani.net" style={{ color: "var(--primary-600)", fontWeight: 600 }}>kvkk@sigortacuzdani.net</a>
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: 0 }}>
              Başvurularınız, kimlik tespitini takiben en geç 30 gün içerisinde ücretsiz olarak sonuçlandırılır.
              İşlemin ayrıca bir maliyeti gerektirmesi halinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
            </p>
          </div>
        </section>

        <section style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--primary-600)", marginBottom: "var(--space-3)" }}>
            10. Politika Güncellemeleri
          </h2>
          <p style={{ color: "var(--text-primary)", marginBottom: "var(--space-3)" }}>
            Bu politika, yasal düzenlemeler ve operasyonel gereksinimler doğrultusunda güncellenebilir.
            Önemli değişiklikler olması halinde, sizi kayıtlı e-posta adresiniz üzerinden bilgilendireceğiz.
            Güncel politikayı her zaman web sitemizden inceleyebilirsiniz.
          </p>
          <div style={{
            background: "var(--neutral-50)",
            borderLeft: "4px solid var(--primary-500)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-sm)"
          }}>
            <p style={{ color: "var(--text-primary)", marginBottom: 0, fontSize: "var(--text-sm)" }}>
              <strong>Son Güncelleme:</strong> 17 Mayıs 2026
            </p>
          </div>
        </section>

        {/* Footer Navigation */}
        <div style={{
          marginTop: "var(--space-8)",
          paddingTop: "var(--space-6)",
          borderTop: "2px solid var(--border-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-4)"
        }}>
          <Link
            href="/"
            style={{
              color: "var(--primary-600)",
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)"
            }}
          >
            ← Ana Sayfaya Dön
          </Link>
          <Link
            href="/login"
            className="btn btn-primary"
          >
            Platforma Giriş Yap
          </Link>
        </div>
      </article>
    </div>
  );
}
