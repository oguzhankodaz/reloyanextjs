/** @format */
import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export async function sendVerificationEmail(
  to: string,
  token: string,
  type: "user" | "company"
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}&type=${type}`;

  // Vercel'de environment variables kontrolü
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ SMTP environment variables eksik");
    return { success: false, error: "SMTP configuration missing" };
  }

  try {
    const transporter: Transporter<SMTPTransport.SentMessageInfo> =
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false, // STARTTLS için false
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // Vercel optimizasyonu
        tls: {
          rejectUnauthorized: false, // Vercel'de gerekli
          minVersion: "TLSv1.2"
        },
        socketTimeout: 10000, // 10 saniye
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        dnsTimeout: 10000,
        // IPv4 kullanımı
        family: 4,
      } as SMTPTransport.Options);

    console.log("📧 Mail gönderim denemesi", {
      to,
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
      type,
    });

    // Bağlantı testi (timeout ile)
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("SMTP verify timeout")), 8000)
      )
    ]);
    
    console.log("🔌 SMTP bağlantısı başarılı");

    const info = await transporter.sendMail({
      from: `"Reloya" <${process.env.SMTP_USER}>`,
      to,
      subject: "Hesabını Doğrula",
      html: `
        <h2>Merhaba,</h2>
        <p>Hesabınızı doğrulamak için aşağıdaki linke tıklayın:</p>
        <p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a></p>
        <p><small>Bu bağlantı 1 saat içinde geçerlidir.</small></p>
      `,
      // Encoding ayarı
      encoding: 'utf-8',
    });

    console.log("✅ Mail gönderildi", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    const finalMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Mail gönderim hatası", { 
      error: finalMsg,
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER 
    });
    return { success: false, error: finalMsg };
  }
}