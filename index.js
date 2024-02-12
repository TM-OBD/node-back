const express = require("express");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth = google.auth.OAuth2;
const app = express();
app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 5000;

if (!PORT) {
  throw new Error(
    ".env Error: Variable 'PORT'  is not defined or does not exist"
  );
}

async function start() {
  try {
    app.listen(PORT, () => {
      console.log("Server has been started on port:", PORT);
    });
  } catch (e) {
    console.log("Server error: ", e);
    process.exit(1);
  }
}

start();

const OAuthClient = new OAuth(
  process.env.GOAUTH_CLIENT_ID,
  process.env.GOAUTH_CLIENT_SECRET
);
OAuthClient.setCredentials({ refresh_token: process.env.GREFRESH_TOKEN });

const get_html_message = (name, phone, question) => {
  return `
  <h3>A new user have some question for us!</h3>
  <p><i>Name:</i> ${name}</p>
  <p><i>Phone number:</i> ${phone}</p>
  <p><b>${question}</b></p>
  `;
};

const send_mail = (name, phone, question) => {
  const accessToken = OAuthClient.getAccessToken();
  const recipient = "zermankarim@gmail.com"; // Needs at admin mail
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL,
      clientId: process.env.GOAUTH_CLIENT_ID,
      clientSecret: process.env.GOAUTH_CLIENT_SECRET,
      refreshToken: process.env.GREFRESH_TOKEN,
      accessToken,
    },
  });
  const mailOptions = {
    from: `OBD QUESTION<${process.env.GMAIL}>`,
    to: recipient,
    subject: "A new question from OBD Web",
    html: get_html_message(name, phone, question),
  };

  return transport.sendMail(mailOptions, (error, result) => {
    if (error) {
      console.log("Error: ", error);
      transport.close();
      return { success: false, error };
    } else {
      console.log("Success", result);
      transport.close();
      return { success: true, result };
    }
  });
};

app.put("/api/v1/feedback", async (req, res) => {
  const { token, feedbackSourceIP } = req.headers;
  const { name, phone, question } = req.body;

  try {
    send_mail(name, phone, question);
    return res.json({ success:true, message: "Feedback was received successfully!" });
  } catch (e) {
    return res.json({ success:false, message: "Error on '/api/v1/feedback' route", e });
  }
});
