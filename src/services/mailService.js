import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendResetPasswordEmail = async ({ to, resetLink }) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Réinitialisation de votre mot de passe CESIZen",
    text: `Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe.

Ouvrez ce lien pour choisir un nouveau mot de passe :
${resetLink}

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.`,
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p><a href="${resetLink}">Cliquer ici pour choisir un nouveau mot de passe</a></p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.</p>
    `,
  });
};
