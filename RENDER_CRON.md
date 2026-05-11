# Render Cron Job Kurulumu — Vade Bildirim Otomasyonu

## 1. Render Dashboard'da Cron Job Oluşturma

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Cron Job**
2. Ayarlar:
   - **Name:** `sigorta-cuzdani-expiry-check`
   - **Schedule:** `0 6 * * *` (her gün saat 06:00 UTC)
   - **Command:**
     ```bash
     curl -X GET https://<YOUR_RENDER_SERVICE_URL>/api/notifications/check-expiry \
       -H "Authorization: Bearer $CRON_SECRET"
     ```
   - **Runtime:** Shell (Docker/native değil, sadece curl komutu)

3. **Environment Variables** sekmesinden:
   - `CRON_SECRET` → `.env` dosyanızdaki değerle aynı değeri girin

## 2. Alternatif: Aynı Serviste Render Native Cron

Eğer Cron Job'ı ayrı bir servis olarak değil, mevcut web servisinizin bir parçası olarak çalıştırmak isterseniz:

1. Render Dashboard → Mevcut Web Service → **Settings** → **Cron Jobs** sekmesi
2. **Add Cron Job:**
   - **Schedule:** `0 6 * * *`
   - **URL Path:** `/api/notifications/check-expiry`
   - **HTTP Method:** GET
   - **Headers:**
     ```
     Authorization: Bearer <CRON_SECRET_VALUE>
     ```

## 3. Environment Variables (.env)

Render servisinizin Environment bölümüne aşağıdaki değişkenleri ekleyin:

```
CRON_SECRET=0e2e3fcaab24ce4834f23e52758ff1432ee8f2cc5d033de79a8c6e8ec10629be
SMTP_HOST=mail.ihs.com.tr
SMTP_PORT=587
SMTP_USER=bildirim@sigortacuzdani.net
SMTP_PASS=<şifreniz>
```

## 4. Test

Deploy sonrası endpoint'i manuel test edin:

```bash
curl -X GET https://<YOUR_RENDER_SERVICE_URL>/api/notifications/check-expiry \
  -H "Authorization: Bearer 0e2e3fcaab24ce4834f23e52758ff1432ee8f2cc5d033de79a8c6e8ec10629be"
```

Başarılı yanıt:
```json
{
  "success": true,
  "data": {
    "tenantsChecked": 1,
    "totalNotifications": 3,
    "channelBreakdown": { "in_app": 3, "email": 2, "sms": 0 },
    "checkedAt": "2026-05-11T06:00:01.123Z",
    "duration": "1450ms"
  }
}
```

## 5. Notlar

- Endpoint hem GET hem de POST destekler. Render Cron default olarak GET kullanır.
- `CRON_SECRET` yoksa dev modda auth olmadan çalışır (lokal geliştirme için).
- Firebase credentials eksikse graceful degradation ile simülasyon yanıtı döner.
- Cron her gün 06:00 UTC'de (Türkiye saati 09:00) çalışır — iş saatinin başında bildirimler inbox'ta olur.
