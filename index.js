const express = require("express");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const axios = require('axios')

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
  <p>Name: <i>${name}</i></p>
  <p>Phone number: <i><a href="tel:${phone}">${phone}</a></i></p>
  <hr>
  <p>${question}</p>
  `;
};

const send_mail = (name, phone, question, res) => {
  const accessToken = OAuthClient.getAccessToken();
  const recipient = process.env.GMAIL_RECIPIENT; // Needs an admin mail
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_SENDER,
      clientId: process.env.GOAUTH_CLIENT_ID,
      clientSecret: process.env.GOAUTH_CLIENT_SECRET,
      refreshToken: process.env.GREFRESH_TOKEN,
      accessToken,
    },
  });
  const mailOptions = {
    from: `OBD QUESTION`,
    to: recipient,
    subject: "A new question from OBD Web",
    html: get_html_message(name, phone, question),
  };

  return transport.sendMail(mailOptions, (error, result) => {
    if (error) {
      console.log("Error: ", error);
      let message = "Error on 'send_email' function";
      transport.close();
      return res.json({ success: false, message, result: error });
    } else {
      console.log("Success", result);
      transport.close();
      message = "Feedback was received successfully!";
      return res.json({ success: true, message, result });
    }
  });
};

app.put("/api/v1/feedback", async (req, res) => {
  const feedbackSourceIP = req.headers["feedback-source-ip"]; // For future
  const { token } = req.headers; // For future
  const { name, phone, question } = req.body;
  if (name && phone && question) {
    send_mail(name, phone, question, res);
  }
  else {
    return res.json({success:false, message: "Some field(-s) is(are) undefined"})
  }
});