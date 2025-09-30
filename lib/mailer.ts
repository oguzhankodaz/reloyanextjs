/** @format */
import sgMail from "@sendgrid/mail";

export async function sendVerificationEmail(
  to: string,
  token: string,
  type: "user" | "company"
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}&type=${type}`;

  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM) {
    console.error("❌ SendGrid yapılandırması eksik", {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? "****" : "undefined",
      SENDGRID_FROM: process.env.SENDGRID_FROM || "undefined",
    });
    return { success: false, error: "SendGrid configuration missing" };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const html = `
    <h2>Merhaba,</h2>
    <p>Hesabınızı doğrulamak için aşağıdaki linke tıklayın:</p>
    <p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a></p>
    <p><small>Bu bağlantı 1 saat içinde geçerlidir.</small></p>
  `;

  const msg = {
    to,
    from: process.env.SENDGRID_FROM as string,
    subject: "Hesabını Doğrula",
    html,
  } as Parameters<typeof sgMail.send>[0];

  try {
    const [res] = await sgMail.send(msg);
    const messageId = res.headers.get("x-message-id") || res.headers.get("x-sendgrid-message-id") || undefined;
    console.log("✅ SendGrid ile mail gönderildi", {
      statusCode: res.statusCode,
      messageId,
      to,
      type,
    });
    return { success: true, messageId };
  } catch (err: any) {
    const sgError = err?.response?.body || err?.message || err;
    console.error("❌ SendGrid mail gönderim hatası", sgError);
    return { success: false, error: typeof sgError === "string" ? sgError : JSON.stringify(sgError) };
  }
}
