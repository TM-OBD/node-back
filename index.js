const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

app.put("/api/v1/feedback", async (req, res) => {
  const { token, feedbackSourceIP } = req.headers;
  const {name, phone, question} = req.body;
  
  res.json({ success: true, message: "Feedback received successfully" });
});
