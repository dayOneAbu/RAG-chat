import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"BanKSupportT" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
}