import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  tls: {
    minVersion: "TLSv1.2",
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `ThreeMail <${process.env.SMTP_FROM}>`,
    to: email,
    replyTo: process.env.SMTP_FROM,
    subject: "[ThreeMail] Email-cím megerősítése",
    headers: {
      "X-Mailer": "ThreeMail",
      "Auto-Submitted": "auto-generated",
    },
    html: `
      <!DOCTYPE html>
      <html lang="hu">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0; padding:24px; background:#f5f5f5; color:#111827; font-family:Arial, sans-serif; line-height:1.5;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:8px;">
            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 16px; font-size:20px;">ThreeMail</h1>
                <p style="margin:0 0 12px; font-size:14px;">Email-cím megerősítése szükséges a fiókod aktiválásához.</p>
                <p style="margin:0 0 20px; font-size:14px;">A megerősítéshez kattints az alábbi linkre:</p>

                <p style="margin:0 0 20px;">
                  <a href="${verificationUrl}" style="display:inline-block; padding:10px 16px; background:#0f766e; color:#ffffff; text-decoration:none; border-radius:6px; font-size:14px;">Email-cím megerősítése</a>
                </p>

                <p style="margin:0 0 8px; font-size:12px; color:#6b7280;">Ha a gomb nem működik, másold be ezt a linket a böngészőbe:</p>
                <p style="margin:0 0 16px; font-size:12px; word-break:break-all;">
                  <a href="${verificationUrl}" style="color:#0f766e;">${verificationUrl}</a>
                </p>

                <p style="margin:0; font-size:12px; color:#6b7280;">Ha nem te kezdeményezted a regisztrációt, ezt az emailt figyelmen kívül hagyhatod.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
ThreeMail - Email-cím megerősítése

Email-cím megerősítése szükséges a fiókod aktiválásához.

Nyisd meg ezt a linket:
${verificationUrl}

Ha nem te kezdeményezted a regisztrációt, ezt az emailt figyelmen kívül hagyhatod.
    `,
  };

  await transporter.sendMail(mailOptions);
}
