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
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `ThreeMail <${process.env.SMTP_FROM}>`,
    to: email,
    replyTo: process.env.SMTP_FROM,
    subject: "Email cím megerősítése - ThreeMail",
    headers: {
      'X-Mailer': 'ThreeMail Banking System',
      'X-Priority': '1',
      'Importance': 'high',
    },
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              color: white;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.5px;
              margin: 0;
            }
            .content { 
              padding: 40px 30px;
              color: #1a1a1a;
              line-height: 1.6;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #0a0a0a;
            }
            .text {
              font-size: 15px;
              color: #2a2a2a;
              margin-bottom: 16px;
            }
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            .button { 
              display: inline-block; 
              padding: 14px 40px; 
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              text-decoration: none; 
              border-radius: 6px;
              font-weight: 600;
              font-size: 15px;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-1px);
            }
            .link-section {
              background: #f9fafb;
              padding: 20px;
              border-radius: 6px;
              margin: 25px 0;
              border: 1px solid #e5e7eb;
            }
            .link-label {
              font-size: 13px;
              color: #4b5563;
              margin-bottom: 8px;
            }
            .link-url {
              word-break: break-all;
              color: #10b981;
              font-size: 13px;
              font-family: monospace;
            }
            .security-note {
              background: #f0fdf4;
              border-left: 4px solid #10b981;
              padding: 15px;
              margin: 25px 0;
              font-size: 14px;
              color: #166534;
            }
            .footer { 
              background: #1a1a1a;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #2a2a2a;
            }
            .footer-text {
              color: #9ca3af;
              font-size: 13px;
              margin: 5px 0;
            }
            .footer-link {
              color: #10b981;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">ThreeMail</h1>
            </div>
            <div class="content">
              <div class="greeting">Tisztelt Ügyfelünk!</div>
              
              <p class="text">
                Köszönjük, hogy a ThreeMail digitális banki szolgáltatását választotta. 
                A regisztráció befejezéséhez kérjük, erősítse meg email címét.
              </p>

              <div class="button-container">
                <a href="${verificationUrl}" class="button">Email cím megerősítése</a>
              </div>

              <div class="link-section">
                <div class="link-label">Vagy másolja be az alábbi linket a böngészőjébe:</div>
                <div class="link-url">${verificationUrl}</div>
              </div>

              <div class="security-note">
                <strong>Biztonsági tájékoztatás:</strong> Ha Ön nem regisztrált a ThreeMail szolgáltatásra, 
                kérjük, hagyja figyelmen kívül ezt az emailt. Fiókja biztonságban van.
              </div>

              <p class="text" style="margin-top: 30px;">
                Tisztelettel,<br>
                <strong>ThreeMail Ügyfélszolgálat</strong>
              </p>
            </div>
            <div class="footer">
              <p class="footer-text">&copy; ${new Date().getFullYear()} ThreeMail. Minden jog fenntartva.</p>
              <p class="footer-text">
                <a href="${process.env.NEXTAUTH_URL}" class="footer-link">threemail.fun</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
ThreeMail - Email cím megerősítése

Tisztelt Ügyfelünk!

Köszönjük, hogy a ThreeMail digitális banki szolgáltatását választotta. 
A regisztráció befejezéséhez kérjük, erősítse meg email címét az alábbi linken:

${verificationUrl}

BIZTONSÁGI TÁJÉKOZTATÁS:
Ha Ön nem regisztrált a ThreeMail szolgáltatásra, kérjük, hagyja figyelmen kívül ezt az emailt. 
Fiókja biztonságban van.

Tisztelettel,
ThreeMail Ügyfélszolgálat

---
© ${new Date().getFullYear()} ThreeMail. Minden jog fenntartva.
threemail.fun
    `,
  };

  await transporter.sendMail(mailOptions);
}
