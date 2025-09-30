/** @format */
import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export async function sendVerificationEmail(
  to: string,
  token: string,
  type: "user" | "company"
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}&type=${type}`;

  // ✅ Environment değişkenleri kontrolü
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ SMTP environment variables eksik", {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS ? "****" : "undefined",
    });
    return { success: false, error: "SMTP configuration missing" };
  }

  async function trySend(
    host: string,
    port: number,
    secure: boolean
  ): Promise<{ success: boolean; messageId?: string }> {
    console.log("🚀 SMTP transporter hazırlanıyor...", { host, port, secure });

    const transporter: Transporter<SMTPTransport.SentMessageInfo> =
      nodemailer.createTransport({
        host,
        port,
        secure, // 465 → SSL, 587 → STARTTLS
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // self-signed sertifika hatalarını engelle
          minVersion: "TLSv1.2",
        },
        connectionTimeout: 10000,
        socketTimeout: 10000,
        greetingTimeout: 10000,
        dnsTimeout: 10000,
        family: 4, // IPv6 sorunlarında IPv4'e zorla
      } as SMTPTransport.Options);

    console.log("📧 Mail gönderim denemesi başlatıldı", {
      to,
      host,
      port,
      secure,
      user: process.env.SMTP_USER,
      type,
    });

    // ✅ SMTP bağlantısı kontrolü
    try {
      await Promise.race([
        transporter.verify(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("SMTP verify timeout")), 8000)
        ),
      ]);
      console.log("🔌 SMTP verify başarılı", { port, secure });
    } catch (verifyErr) {
      console.error("❌ SMTP verify hatası", {
        port,
        secure,
        error: verifyErr instanceof Error ? verifyErr.message : verifyErr,
        stack: verifyErr instanceof Error ? verifyErr.stack : null,
      });
      throw verifyErr;
    }

    // ✅ Mail gönderme
    try {
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
        encoding: "utf-8",
      });

      console.log("✅ Mail gönderildi", {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        envelope: info.envelope,
        pending: info.pending,
      });

      return { success: true, messageId: info.messageId };
    } catch (sendErr) {
      console.error("❌ sendMail hatası", {
        port,
        secure,
        error: sendErr instanceof Error ? sendErr.message : sendErr,
        stack: sendErr instanceof Error ? sendErr.stack : null,
      });
      throw sendErr;
    }
  }

  try {
    // 🔹 Öncelik 465 (SSL)
    console.log("🟢 465 (SSL) portu ile deneme yapılıyor...");
    return await trySend(process.env.SMTP_HOST, 465, true);
  } catch (err465) {
    console.error("⚠️ 465 ile gönderim başarısız", {
      error: err465 instanceof Error ? err465.message : String(err465),
      stack: err465 instanceof Error ? err465.stack : null,
    });

    // 🔹 Fallback 587 (STARTTLS)
    try {
      console.log("🟡 587 (STARTTLS) fallback denemesi başlatılıyor...");
      return await trySend(process.env.SMTP_HOST, 587, false);
    } catch (err587) {
      console.error("❌ 587 ile gönderim de başarısız", {
        error: err587 instanceof Error ? err587.message : String(err587),
        stack: err587 instanceof Error ? err587.stack : null,
      });
      return {
        success: false,
        error: err587 instanceof Error ? err587.message : String(err587),
      };
    }
  }
}
