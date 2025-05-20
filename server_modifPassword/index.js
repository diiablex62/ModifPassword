require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./database/config");
const cookieParser = require("cookie-parser");
const path = require("path"); // pour le build

const __DIRNAME = path.resolve(); // pour le build

const app = express();

// Configuration pour le proxy
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL.split(","),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Ajout d'un middleware pour logger les requêtes CORS
app.use((req, res, next) => {
  console.log("Requête reçue:", {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers,
  });
  next();
});

// pour le build
app.use(express.static(path.join(__DIRNAME, "client_modifPassword/dist")));

const routes = require("./routes");
const { generalLimiter } = require("./middlewares/rateLimitMiddleware");

app.use(generalLimiter);

// Log pour vérifier l'URL du client
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("Origines autorisées:", process.env.CLIENT_URL.split(","));

// Routes API d'abord
app.use("/api", routes);

// Middleware pour logger les erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Route catch-all en dernier
app.get("/", (req, res) => {
  console.log("Route catch-all atteinte pour:", req.url);
  res.sendFile(
    path.join(__DIRNAME, "client_modifPassword", "dist", "index.html")
  );
});

mongoose
  .connect(config.mongoDb.uri)
  .then(() => {
    console.log("Connexion Mongo DB OK");
  })
  .catch((err) => console.log(err));

// Utilisation de process.env.PORT pour Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// localhost:3000
