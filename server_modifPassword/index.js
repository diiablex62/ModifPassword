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

// Nettoyage des URLs
const cleanUrls = (urls) => {
  if (!urls) {
    console.log("Aucune URL fournie");
    return [];
  }

  console.log("URLs avant nettoyage:", urls);

  const cleanedUrls = urls
    .split(",")
    .map((url) => {
      const trimmedUrl = url.trim();
      // Ajouter https:// si le protocole est manquant
      if (
        trimmedUrl &&
        !trimmedUrl.startsWith("http://") &&
        !trimmedUrl.startsWith("https://")
      ) {
        return `https://${trimmedUrl}`;
      }
      return trimmedUrl;
    })
    .filter((url) => url);

  console.log("URLs après nettoyage:", cleanedUrls);
  return cleanedUrls;
};

// Configuration CORS plus détaillée
const corsOptions = {
  origin: function (origin, callback) {
    console.log("Origine de la requête:", origin);

    // En production, accepter toutes les requêtes
    if (process.env.NODE_ENV === "production") {
      console.log("Mode production - toutes les origines acceptées");
      callback(null, true);
      return;
    }

    // En développement, vérifier l'origine
    const allowedOrigins = process.env.CLIENT_URL
      ? [process.env.CLIENT_URL]
      : ["http://localhost:5173"];
    console.log("Origines autorisées:", allowedOrigins);

    if (!origin || allowedOrigins.includes(origin)) {
      console.log("Origine autorisée:", origin);
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
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Methods",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 heures
};

// Ajout d'un middleware pour gérer les requêtes OPTIONS
app.options("*", cors(corsOptions));

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
  // Ajout des en-têtes CORS manuellement pour plus de sécurité
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  res.header("Access-Control-Allow-Credentials", "true");
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
  console.log("Configuration CORS:", corsOptions);
});

// localhost:3000
