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
    const transporter: Transporter<SMTPTransport.SentMessageInfo> =
      nodemailer.createTransport({
        host: process.env.SMTP_HOST || "mail.reloya.com",
        port: Number(process.env.SMTP_PORT) || 587, // 587 → STARTTLS
        secure: false, // STARTTLS için secure:false
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        family: 4, // IPv6 sorunlarına karşı IPv4
        tls: {
          rejectUnauthorized: false,
          servername: process.env.SMTP_HOST,
        },
        connectionTimeout: 10000,
        socketTimeout: 10000,
      } as SMTPTransport.Options);

    console.log("📧 Mail gönderim denemesi", {
      to,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      type,
    });

    await transporter.verify();
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
    });

    console.log("✅ Mail gönderildi", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    const finalMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Mail gönderim hatası", { error: finalMsg });
    return { success: false, error: finalMsg };
  }
}
