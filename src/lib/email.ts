import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Erősítsd meg az email címed - ThreeMail",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Üdvözlünk a ThreeMail-nél!</h1>
            </div>
            <div class="content">
              <p>Szia!</p>
              <p>Köszönjük, hogy regisztráltál a ThreeMail-nél. Kérjük, erősítsd meg az email címedet az alábbi gombra kattintva:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Email cím megerősítése</a>
              </div>
              <p>Vagy másold be ezt a linket a böngésződbe:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p>Ha nem te regisztráltál, kérjük, hagyd figyelmen kívül ezt az emailt.</p>
              <p>Üdvözlettel,<br>A ThreeMail csapata</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ThreeMail. Minden jog fenntartva.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Üdvözlünk a ThreeMail-nél!

Köszönjük, hogy regisztráltál. Kérjük, erősítsd meg az email címedet az alábbi linkre kattintva:

${verificationUrl}

Ha nem te regisztráltál, kérjük, hagyd figyelmen kívül ezt az emailt.

Üdvözlettel,
A ThreeMail csapata
    `,
  };

  await transporter.sendMail(mailOptions);
}
