export const BASE_URL = import.meta.env.PROD
  ? "https://modifpassword-backend.onrender.com" // URL du backend
  : "http://localhost:3000";

console.log("URL de base utilisée:", BASE_URL);
