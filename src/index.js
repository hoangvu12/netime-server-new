const express = require("express");
const cors = require("cors");
const path = require("path");

const routes = require("./routes");
const cache = require("./middlewares/cache");
const errorHandler = require("./middlewares/errorHandler");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cache());
app.use("/api/v1", routes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Listening at", PORT);
});
