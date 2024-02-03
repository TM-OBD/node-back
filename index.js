const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());

app.get("/auth/test", (req, res) => {
  // sendStatus отправляет указанный статус в ответ
  // для отправки других данных используется JSON
  // формат отправки res.json({"какие-то данные"})
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
