/** @format */
// Bu util dosyası sadece sunucuda kullanılmalı:
import "server-only";
import nodemailer from "nodemailer";

type SendVerificationResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

// Amazon SES transporter oluşturma
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'email-smtp.us-east-1.amazonaws.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function errorToMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  type: "user" | "company"
): Promise<SendVerificationResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;

  if (!emailUser || !emailPass || !from || !appUrl) {
    console.error("❌ Amazon SES config missing", {
      hasEmailUser: !!emailUser,
      hasEmailPass: !!emailPass,
      hasFrom: !!from,
      hasAppUrl: !!appUrl,
    });
    return { success: false, error: "Amazon SES configuration missing" };
  }

  const resetUrl = type === "user" 
    ? `${appUrl}/reset-password?token=${token}`
    : `${appUrl}/company/reset-password?token=${token}`;
  
  const transporter = createTransporter();

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; border:1px solid #e5e5e5; border-radius:8px; padding:24px;">
    <div style="text-align:center; margin-bottom:24px;">
      <h1 style="color:#111;">ReloYa</h1>
    </div>
    <h2 style="color:#111;">Şifre Sıfırlama Talebi</h2>
    <p>Merhaba,</p>
    <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi oluşturmak için aşağıdaki butona tıklayın. Bu bağlantı yalnızca <strong>1 saat</strong> boyunca geçerlidir.</p>
    <div style="text-align:center; margin:30px 0;">
      <a href="${resetUrl}" target="_blank" rel="noopener" style="background:#dc2626; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
        Şifremi Sıfırla
      </a>
    </div>
    <p>Eğer bu işlemi siz başlatmadıysanız, bu e-postayı görmezden gelebilirsiniz ve şifreniz değişmeyecektir.</p>
    <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;" />
    <p style="font-size:12px; color:#666; text-align:center;">
      Bu e-posta ReloYa sistemi tarafından otomatik olarak gönderilmiştir.<br/>
      © ${new Date().getFullYear()} ReloYa. Tüm hakları saklıdır.
    </p>
  </div>`;

  const mailOptions = {
    from: `"ReloYa" <${from}>`,
    to,
    subject: "Şifre Sıfırlama - ReloYa",
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (e: unknown) {
    const message = errorToMessage(e);
    console.error("❌ Amazon SES send error:", message);
    return { success: false, error: message };
  }
}

export async function sendVerificationEmail(
  to: string,
  token: string,
  type: "user" | "company"
): Promise<SendVerificationResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;

  if (!emailUser || !emailPass || !from || !appUrl) {
    console.error("❌ Amazon SES config missing", {
      hasEmailUser: !!emailUser,
      hasEmailPass: !!emailPass,
      hasFrom: !!from,
      hasAppUrl: !!appUrl,
    });
    return { success: false, error: "Amazon SES configuration missing" };
  }

  const verifyUrl = `${appUrl}/api/verify?token=${token}&type=${type}`;
  const transporter = createTransporter();

  // Doğrulama e-postası: izleme kapalı → daha hızlı/temiz teslim
  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; border:1px solid #e5e5e5; border-radius:8px; padding:24px;">
    <div style="text-align:center; margin-bottom:24px;">
      <h1 style="color:#111;">ReloYa</h1>
    </div>
    <h2 style="color:#111;">Merhaba,</h2>
    <p>Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın. Bu bağlantı yalnızca <strong>1 saat</strong> boyunca geçerlidir.</p>
    <div style="text-align:center; margin:30px 0;">
      <a href="${verifyUrl}" target="_blank" rel="noopener" style="background:#111; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block;">
        Hesabımı Doğrula
      </a>
    </div>
    <p>Eğer bu işlemi siz başlatmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    <hr style="margin:30px 0; border:none; border-top:1px solid #ddd;" />
    <p style="font-size:12px; color:#666; text-align:center;">
      Bu e-posta ReloYa sistemi tarafından otomatik olarak gönderilmiştir.<br/>
      © ${new Date().getFullYear()} ReloYa. Tüm hakları saklıdır.
    </p>
  </div>`;

  const mailOptions = {
    from: `"ReloYa" <${from}>`,
    to,
    subject: "Hesabınızı Doğrulayın - ReloYa",
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (e: unknown) {
    const message = errorToMessage(e);
    console.error("❌ Amazon SES send error:", message);
    return { success: false, error: message };
  }
}
