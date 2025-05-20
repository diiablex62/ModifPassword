require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./database/config");
const cookieParser = require("cookie-parser");
const path = require("path"); // pour le build

const __DIRNAME = path.resolve(); // pour le build

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type"],
  })
);

// pour le build
app.use(express.static(path.join(__DIRNAME, "client_modifPassword/dist")));

const routes = require("./routes");
const { generalLimiter } = require("./middlewares/rateLimitMiddleware");

app.use(generalLimiter);

app.use(routes);

// pour le build
app.get("*", (req, res) => {
  res.sendFile(path.join(__DIRNAME, "client_modifPassword", "dist", "index.html"));
});

mongoose
  .connect(config.mongoDb.uri)
  .then(() => {
    console.log("Connexion Mongo DB OK");
  })
  .catch((err) => console.log(err));

app.listen(3000);

// localhost:3000
