import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, token: string, type: "user" | "company") {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?token=${token}&type=${type}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // 465 için true
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Reloya" <${process.env.SMTP_USER}>`,
    to,
    subject: "Hesabını Doğrula",
    html: `
      <h2>Merhaba,</h2>
      <p>Hesabınızı doğrulamak için aşağıdaki linke tıklayın:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>Bu bağlantı 1 saat içinde geçerlidir.</p>
    `,
  });
}
