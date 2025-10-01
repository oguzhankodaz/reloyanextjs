# KVKK Compliance Implementation - ReloYa

## ✅ Tamamlanan İşlemler

### 1. Veritabanı Şeması (Prisma)

**Yeni Tablolar:**
- `UserConsent` - Kullanıcı rıza kayıtları (pazarlama, analitik vb.)
- `DsarRequest` - Veri talepleri (export, delete, rectify)
- `AuditLog` - Tüm veri değişikliklerinin denetim kaydı

**Migration:**
- ✅ Migration çalıştırıldı: `20251001072926_add_kvkk_compliance`
- ✅ User modeline ilişkiler eklendi (`consents`, `dsarRequests`)

### 2. Legal Yapılandırma

**Dosya:** `legal/config.ts`
- Şirket bilgileri (ad, adres, iletişim)
- KVKK sorumlusu bilgileri
- Veri saklama süreleri
- Yurt dışı veri aktarımı detayları
- Çerez kategorileri ve detayları
- İlgili kişi hakları listesi

### 3. Legal Sayfalar (Türkçe)

**Oluşturulan Sayfalar:**
- ✅ `/privacy` - KVKK Aydınlatma Metni
- ✅ `/terms` - Hizmet Koşulları
- ✅ `/cookies` - Çerez Politikası
- ✅ Footer güncellendi (legal sayfa linkleri)

**Özellikler:**
- Responsive tasarım
- Mevcut Tailwind/Shadcn stiline uyumlu
- `legal/config.ts` değişkenlerini kullanıyor
- Cross-border veri aktarımı bilgilendirmesi

### 4. Rate Limiting

**Dosya:** `lib/rateLimit.ts`

**Özellikler:**
- In-memory Map tabanlı (hafif, bağımlılık yok)
- IP + UserID bazlı tracking
- DSAR endpoints: 5 req/10 dk
- Genel API: 100 req/dk
- Otomatik cleanup (memory leak önleme)
- Vercel edge-compatible

### 5. DSAR API Endpoints

#### a) `/api/dsar/export` (GET)
**Özellikler:**
- Kullanıcının tüm verilerini JSON olarak dışa aktarma
- İçerik: profil, satın almalar, puanlar, rıza kayıtları
- Rate limit korumalı
- Talep kaydı oluşturma

#### b) `/api/dsar/delete` (POST/GET)
**Özellikler:**
- Silme talebi oluşturma (hard-delete yapılmıyor)
- POST: Talep oluştur
- GET: Mevcut talepleri listele
- SLA bilgisi (30 gün)
- Audit log kaydı
- Mükerrer talep kontrolü

#### c) `/api/dsar/rectify` (POST/GET)
**Özellikler:**
- Veri düzeltme talebi
- Ad/soyad: Direkt güncelleme
- E-posta/telefon: Onay talebi oluşturma
- POST: Düzeltme talebi/güncelleme
- GET: Geçmiş talepleri listele
- Validasyon (email, name format)

**Tüm Endpoint'lerde:**
- ✅ Authentication (getUserFromCookie)
- ✅ Rate limiting
- ✅ Audit logging
- ✅ IP tracking
- ✅ Error handling

### 6. Kullanıcı Arayüzü

#### a) `/account/privacy` - Gizlilik Dashboard
**Özellikler:**
- 4 ana kart:
  - 📥 Verilerimi İndir
  - ✏️ Bilgilerimi Düzelt
  - 🗑️ Hesabımı Sil
  - 🛡️ Rızalarım (yakında)
- KVKK hakları bilgilendirmesi
- Legal sayfa linkleri
- Toast notification'lar
- Loading states

#### b) `/account/edit` - Profil Düzenleme
**Özellikler:**
- Ad, soyad, e-posta, telefon güncelleme
- Validation
- E-posta değişikliği uyarısı
- Direkt update vs talep ayrımı
- Auth context güncelleme

### 7. Güvenlik ve Uyumluluk

**Güvenlik:**
- ✅ HttpOnly cookies (oturum)
- ✅ Rate limiting (abuse önleme)
- ✅ Authentication checks
- ✅ IP tracking
- ✅ Audit logging

**KVKK Uyumluluğu:**
- ✅ Aydınlatma metni (m.10)
- ✅ İlgili kişi hakları (m.11)
- ✅ Veri aktarımı bilgilendirmesi (m.9)
- ✅ Rıza yönetimi altyapısı
- ✅ Saklama süreleri tanımlı
- ✅ Silme talebi işleyişi
- ✅ Düzeltme hakkı

**Cross-Border Compliance:**
- ✅ Yurt dışı aktarımlar belgelenmiş
- ✅ Hukuki dayanaklar açıklanmış
- ✅ Sağlayıcılar listelenmiş (Vercel, Neon, SendGrid)

## 📁 Dosya Yapısı

```
reloyanextjs/
├── legal/
│   └── config.ts                      # Merkezi legal yapılandırma
├── lib/
│   └── rateLimit.ts                   # Rate limiting utility
├── app/
│   ├── privacy/page.tsx               # KVKK Aydınlatma
│   ├── terms/page.tsx                 # Hizmet Koşulları
│   ├── cookies/page.tsx               # Çerez Politikası
│   ├── account/
│   │   ├── privacy/page.tsx           # DSAR Dashboard
│   │   └── edit/page.tsx              # Profil düzenleme
│   └── api/
│       └── dsar/
│           ├── export/route.ts        # Veri dışa aktarma
│           ├── delete/route.ts        # Silme talebi
│           └── rectify/route.ts       # Düzeltme talebi
├── components/
│   └── Footer.tsx                     # Güncellendi (legal linkler)
└── prisma/
    ├── schema.prisma                  # KVKK tabloları eklendi
    └── migrations/
        └── 20251001072926_add_kvkk_compliance/
```

## 🔧 Yapılandırma Gereksinimleri

### legal/config.ts'de Güncellenecekler

```typescript
company: {
  name: "ReloYa Teknoloji A.Ş.",
  address: "Gerçek adresiniz",
  email: "gerçek@email.com",
  phone: "+90 (212) XXX XX XX",
  mersisNo: "Gerçek MERSIS",
  tradeRegisterNo: "Gerçek sicil no",
}
```

## 🚀 Deployment Checklist

- [ ] `legal/config.ts` şirket bilgileri güncellendi
- [ ] Database migration çalıştırıldı
- [ ] E-posta şablonları hazırlandı (DSAR bildirimleri için)
- [ ] Admin paneli DSAR talep yönetimi için hazırlandı (opsiyonel)
- [ ] Legal metinler hukuk departmanı tarafından onaylandı
- [ ] KVKK Verbis'e kayıt yapıldı (gerekirse)

## 📊 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| DSAR Export | 5 req | 10 dk |
| DSAR Delete | 5 req | 10 dk |
| DSAR Rectify | 5 req | 10 dk |
| Genel API | 100 req | 1 dk |

## 🔐 Güvenlik Notları

1. **Rate Limiting:** In-memory (tek sunucu). Prod'da Redis önerilir.
2. **Audit Logs:** Sadece veritabanında. Log aggregation sistemi eklenebilir.
3. **DSAR Delete:** Soft delete - admin onayı gerektirir.
4. **Email Change:** Güvenlik nedeniyle onay talebi oluşturur.

## 📝 Admin İşlemleri (Manuel)

DSAR talepleriniz `DsarRequest` tablosunda `pending` statusünde oluşur:

```sql
-- Bekleyen talepleri görüntüle
SELECT * FROM "DsarRequest" WHERE status = 'pending';

-- Talebi onayla
UPDATE "DsarRequest" 
SET status = 'processing', "processedAt" = NOW() 
WHERE id = 'talep-id';

-- Talebi tamamla
UPDATE "DsarRequest" 
SET status = 'completed', "completedAt" = NOW(), response = 'İşlem tamamlandı' 
WHERE id = 'talep-id';
```

Gelecekte admin dashboard'a entegre edilebilir.

## 🎯 Gelecek İyileştirmeler

1. **Consent Management UI** - Rıza yönetim arayüzü
2. **Admin Dashboard** - DSAR talep yönetimi
3. **Email Notifications** - Talep durumu bildirimleri
4. **Çerez Consent Banner** - İlk ziyarette çerez onayı
5. **Data Portability** - GDPR uyumlu veri taşınabilirliği
6. **Redis Rate Limiting** - Distributed rate limiting

## ✅ Test Edilenler

- ✅ Migration başarıyla çalıştı
- ✅ Legal sayfalar erişilebilir
- ✅ Footer linkleri çalışıyor
- ✅ API endpoint'leri oluşturuldu
- ✅ UI sayfaları render ediliyor

## 📞 Destek

KVKK uyumluluğu ile ilgili sorularınız için:
- Email: kvkk@reloya.com
- Legal config: `legal/config.ts`
- API docs: Bu dosya

---

**Son Güncelleme:** 1 Ekim 2025
**Versiyon:** 1.0.0
**Durum:** ✅ Tamamlandı ve deploy'a hazır

