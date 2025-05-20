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

// Log des variables d'environnement
console.log("Variables d'environnement:", {
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  API_URL: process.env.API_URL,
});

// Configuration CORS plus détaillée
const corsOptions = {
  origin: function (origin, callback) {
    console.log("Origine de la requête:", origin);
    const allowedOrigins = process.env.CLIENT_URL.split(",");
    console.log("Origines autorisées:", allowedOrigins);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Origine non autorisée:", origin);
      callback(new Error("Non autorisé par CORS"));
    }
  },
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
};

app.use(cors(corsOptions));

// Middleware pour logger toutes les requêtes
app.use((req, res, next) => {
  console.log("Requête reçue:", {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers,
    ip: req.ip,
  });
  next();
});

// pour le build
app.use(express.static(path.join(__DIRNAME, "client_modifPassword/dist")));

const routes = require("./routes");
const { generalLimiter } = require("./middlewares/rateLimitMiddleware");

app.use(generalLimiter);

// Routes API d'abord
app.use("/api", routes);

// Middleware pour logger les erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Routes pour le frontend
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__DIRNAME, "client_modifPassword", "dist", "index.html")
  );
});

// Route catch-all pour le frontend
app.get("/*", (req, res) => {
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
  console.log("Configuration CORS:", corsOptions);
});

// localhost:3000
