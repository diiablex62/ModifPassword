export const BASE_URL = import.meta.env.PROD
  ? "https://modifpassword-backend.onrender.com/api" // Ajout de /api pour correspondre à la route du backend
  : "http://localhost:3000/api";

console.log("URL de base utilisée:", BASE_URL);
