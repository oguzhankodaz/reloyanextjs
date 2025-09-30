/** @format */
import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export async function sendVerificationEmail(
  to: string,
  token: string,
  type: "user" | "company"
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}&type=${type}`;

  try {
    const envHost = process.env.SMTP_HOST || "mail.reloya.com";
    const envPort = Number(process.env.SMTP_PORT) || 587;
    const firstIsSsl465 = envPort === 465;

    async function trySend(
      host: string,
      port: number,
      secure: boolean
    ): Promise<{ success: boolean; messageId?: string }> {
      const transporter: Transporter<SMTPTransport.SentMessageInfo> =
        nodemailer.createTransport({
          host,
          port,
          secure, // 465 → SSL, 587 → STARTTLS
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          family: 4, // IPv6 sorunlarında IPv4'e zorla
          tls: {
            rejectUnauthorized: false,
            servername: host,
          },
          connectionTimeout: 10000,
          socketTimeout: 10000,
        } as SMTPTransport.Options);

      console.log("📧 Mail gönderim denemesi", {
        to,
        host,
        port,
        user: process.env.SMTP_USER,
        secure,
        type,
      });

      try {
        await transporter.verify();
        console.log("🔌 SMTP verify başarılı", { host, port, secure });
      } catch (verifyErr) {
        const errMsg =
          verifyErr instanceof Error ? verifyErr.message : String(verifyErr);
        console.error("⚠️ SMTP verify hatası", { host, port, secure, error: errMsg });
      }

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
      });

      console.log("✅ Mail gönderildi", {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        host,
        port,
        secure,
      });
      return { success: true, messageId: info.messageId };
    }

    try {
      // İlk deneme: ENV ayarları
      return await trySend(envHost, envPort, firstIsSsl465);
    } catch (firstErr) {
      const errMsg =
        firstErr instanceof Error ? firstErr.message : String(firstErr);
      console.error("❌ İlk deneme başarısız", {
        error: errMsg,
        host: envHost,
        port: envPort,
        secure: firstIsSsl465,
      });

      // Fallback 465 ↔ 587
      const fallbackPort = firstIsSsl465 ? 587 : 465;
      const fallbackSecure = !firstIsSsl465;
      try {
        console.log("↩️ Fallback denemesi", {
          host: envHost,
          port: fallbackPort,
          secure: fallbackSecure,
        });
        return await trySend(envHost, fallbackPort, fallbackSecure);
      } catch (fallbackErr) {
        const fallbackMsg =
          fallbackErr instanceof Error
            ? fallbackErr.message
            : String(fallbackErr);
        console.error("❌ Fallback denemesi de başarısız", {
          error: fallbackMsg,
          host: envHost,
          port: fallbackPort,
          secure: fallbackSecure,
        });
        throw fallbackErr;
      }
    }
  } catch (err) {
    const finalMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Mail gönderim hatası", { error: finalMsg });
    return { success: false, error: finalMsg };
  }
}
