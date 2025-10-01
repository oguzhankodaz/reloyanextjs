/** @format */

/**
 * Legal & KVKK Configuration
 * Tüm yasal metinlerde kullanılacak merkezi değişkenler
 */

export const LEGAL_CONFIG = {
  company: {
    name: "Asekod Yazılım Ltd. Şti.",
    shortName: "Asekod",
    address: "Adana, Çukurova",
    email: "info@asekod.com",
    phone: "0534 731 29 91",
    mersisNo: "", // MERSIS numarası
    tradeRegisterNo: "", // Ticaret sicil no
  },
  
  dpo: {
    // Veri Sorumlusu Temsilcisi / Data Protection Officer
    name: "KVKK Sorumlusu",
    email: "info@asekod.com",
    phone: "0534 731 29 91",
  },

  data: {
    // Veri saklama süreleri (yıl)
    retentionPeriods: {
      userAccount: 10, // Hesap verileri - yasal zorunluluk
      purchases: 10, // Satın alma kayıtları - vergi/muhasebe
      consents: 10, // Rıza kayıtları
      auditLogs: 10, // Denetim kayıtları
    },
    
    // DSAR işlem SLA (gün)
    dsarSla: 30,
  },

  crossBorder: {
    // Yurt dışına veri aktarımı yapılan ülkeler ve yasal dayanaklar
    transfers: [
      {
        country: "Avrupa Birliği",
        provider: "Bulut altyapı hizmeti sağlayıcısı",
        legalBasis: "Standart sözleşme hükümleri ve yeterli koruma",
      },
      {
        country: "Avrupa Birliği", 
        provider: "E-posta hizmeti sağlayıcısı",
        legalBasis: "Yeterli koruma sağlanmış",
      },
    ],
  },

  cookies: {
    // Çerez kategorileri ve detayları
    categories: {
      necessary: {
        name: "Zorunlu Çerezler",
        description: "Platformun çalışması için gerekli çerezler",
        cookies: [
          {
            name: "Oturum Çerezleri",
            purpose: "Kullanıcı kimlik doğrulama ve oturum yönetimi",
            duration: "7 gün",
            type: "HttpOnly, Güvenli",
          },
        ],
      },
      functional: {
        name: "İşlevsel Çerezler",
        description: "Kullanıcı tercihlerini hatırlayan çerezler",
        cookies: [
          // Şu an kullanılmamaktadır
        ],
      },
      analytics: {
        name: "Analitik Çerezler",
        description: "Platform kullanımını analiz eden çerezler",
        cookies: [
          // Şu an kullanılmamaktadır
        ],
      },
      marketing: {
        name: "Reklam Çerezleri",
        description: "Pazarlama ve hedefleme için çerezler",
        cookies: [
          // Şu an kullanılmamaktadır
        ],
      },
    },
  },

  kvkk: {
    // İlgili kişi hakları
    rights: [
      "Kişisel verilerinin işlenip işlenmediğini öğrenme",
      "İşlenmişse buna ilişkin bilgi talep etme",
      "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
      "Yurt içi/dışında aktarıldığı 3. kişileri bilme",
      "Eksik/yanlış işlenmişse düzeltilmesini isteme",
      "KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme",
      "Düzeltme, silme ve yok edilme işlemlerinin paylaşıldığı 3. kişilere bildirilmesini isteme",
      "İşlenen verilerin analizi sonucu aleyhe bir sonuç çıkmasına itiraz etme",
      "KVKK'ya aykırı işleme nedeniyle zarara uğraması hâlinde zararın giderilmesini talep etme",
    ],

    // İşleme amaçları
    purposes: [
      "Kullanıcı hesabı oluşturma ve yönetimi",
      "Sadakat programı işletimi ve puan takibi",
      "Satın alma işlemlerinin gerçekleştirilmesi",
      "Müşteri destek hizmetleri sunumu",
      "Platform güvenliğinin sağlanması",
      "Yasal yükümlülüklerin yerine getirilmesi",
      "İstatistiksel analiz ve raporlama",
    ],

    // Hukuki sebepler
    legalBases: [
      "Sözleşmenin kurulması ve ifası (KVKK m.5/2-c)",
      "Veri sorumlusunun meşru menfaati (KVKK m.5/2-f)",
      "Kanunlarda açıkça öngörülmesi (KVKK m.5/2-a)",
    ],
  },
} as const;

