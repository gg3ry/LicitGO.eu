import mailer from "nodemailer";
import { sendEmail } from "./utilities.js";
async function sendVerificationEmail(email, userId, type) {
  function random_code() {
    const min = 100000;
    const max = 999999;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const code = random_code();
  async function createEmailCode() {
    const expiresAt = new Date(Date.now() + 600000);
    await app.db.query(
      "INSERT INTO email_codes (user_id, code, expires_at, type) VALUES (?, ?, ?, ?)",
      [userId, code, expiresAt, type]
    );
  }

  if (!(type == "verification" || type == "password_reset")) {
    throw new Error("Invalid email code type");
  }
  await createEmailCode();
  if (type == "password_reset") {
    const htmlMessage = `
      <div class="email-container">
          <h2 class="email-header">Jelszó visszaállítása</h2>
          <p class="email-content">Kérjük, használja az alábbi kódot jelszava visszaállításához:</p>
          <div class="code-box">
              <strong>${code}</strong>
          </div>
          <p><b>Figyelem:</b> Ez a kód <i>10 percig</i> érvényes. Kérjük, ne ossza meg ezt a kódot másokkal.</p>
          <a href="https://licitgo.eu/reset-password" class="email-button">Jelszó visszaállítása</a>
          <p class="email-footer">Üdvözlettel,<br>A LicitGO.eu Csapat</p>
      </div>
      `;
    await sendEmail( email, "Jelszó visszaállítá", htmlMessage );
  }
  if (type == "verification") {
    const htmlMessage = `
      <div class="email-container">
          <h2 class="email-header">Fiók megerősítése</h2>
          <p class="email-content">Köszönjük, hogy regisztrált a LicitGO.eu oldalra! Kérjük, használja az alábbi kódot fiókja megerősítéséhez:</p>
          <div class="code-box">
              <strong>${code}</strong>
          </div>
          <p><b>Figyelem:</b> Ez a kód <i>10 percig</i> érvényes. Kérjük, ne ossza meg ezt a kódot másokkal.</p>
          <a href="https://licitgo.eu/verify-account" class="email-button">Fiók megerősítése</a>
          <p class="email-footer">Üdvözlettel,<br>A LicitGO.eu Csapat</p>
      </div>
      `;
    await sendEmail( email, "Fiók megerősítés", htmlMessage );
  }
}
export { sendVerificationEmail };
