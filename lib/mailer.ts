/** @format */
import sgMail, { MailDataRequired } from "@sendgrid/mail";

type SendVerificationResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendVerificationEmail(
  to: string,
  token: string,
  type: "user" | "company"
): Promise<SendVerificationResult> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}&type=${type}`;

  // ✅ ENV kontrolü
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM) {
    console.error("❌ SendGrid yapılandırması eksik", {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? "****" : "undefined",
      SENDGRID_FROM: process.env.SENDGRID_FROM || "undefined",
    });
    return { success: false, error: "SendGrid configuration missing" };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  // ✅ Daha kurumsal HTML içerik
  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; border:1px solid #e5e5e5; border-radius:8px; padding:24px;">
    <div style="text-align:center; margin-bottom:24px;">
      <h1 style="color:#111;">Reloya</h1>
    </div>
    <h2 style="color:#111;">Merhaba,</h2>
    <p>Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın. Bu bağlantı yalnızca <strong>1 saat</strong> boyunca geçerlidir.</p>
    <div style="text-align:center; margin:30px 0;">
      <a href="${verifyUrl}" target="_blank" style="background:#111; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
        Hesabımı Doğrula
      </a>
    </div>
    <p>Eğer bu işlemi siz başlatmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;" />
    <p style="font-size:12px; color:#666; text-align:center;">
      Bu e-posta Reloya sistemi tarafından otomatik olarak gönderilmiştir.<br/>
      © ${new Date().getFullYear()} ReloYa. Tüm hakları saklıdır.
    </p>
  </div>
  `;

  const msg: MailDataRequired = {
    to,
    from: {
      email: process.env.SENDGRID_FROM as string,
      name: "ReloYa",
    },
    subject: "Hesabınızı Doğrulayın - ReloYa",
    html,
  };

  try {
    const [res] = await sgMail.send(msg);
    const messageId =
      res.headers?.get("x-message-id") ||
      res.headers?.get("x-sendgrid-message-id") ||
      undefined;

    console.log("✅ SendGrid ile mail gönderildi", {
      statusCode: res.statusCode,
      messageId,
      to,
      type,
    });

    return { success: true, messageId };
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null
        ? JSON.stringify(err)
        : String(err);

    console.error("❌ SendGrid mail gönderim hatası", errorMessage);

    return { success: false, error: errorMessage };
  }
}
