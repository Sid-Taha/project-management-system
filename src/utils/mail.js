import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Project Manager",
      link: "https://taskmanagelink.com",
    },
  });

  // email in text format
  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);

  // email in HTML format
  const emailHTML = mailGenerator.generate(options.mailgenContent);

  // creating transport for sending email
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

    // defining email options
    const mail = {
        from: 'mail.taskmanager@example.com',
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHTML,
    };
    
    // sending email
    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }


};

// ----------------------------------- Email Verification Mailgen Content --------------------------
const emailVerificationMailgenContent = (username, verificationURL) => {
  return {
    body: {
      name: username,
      intro: "Welcome to our App! We're very excited to have you on board.",
      action: {
        instructions:
          "Please click the following button to verify your account:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Confirm your account",
          link: verificationURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

// ----------------------------------- Forget Password Mailgen Content --------------------------
const forgetPasswordMailgenContent = (username, passwordResetURL) => {
  return {
    body: {
      name: username,
      intro:
        "You have requested to reset your password. Please click the button below to proceed.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset your password",
          link: passwordResetURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export { emailVerificationMailgenContent, forgetPasswordMailgenContent, sendEmail };
