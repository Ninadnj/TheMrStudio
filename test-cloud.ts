import { config } from "dotenv";
config(); // Load the ENV
import { v2 as cloudinary } from "cloudinary";

console.log("CLOUDINARY_URL:", process.env.CLOUDINARY_URL);
cloudinary.config(true); // Is this valid? We can just log cloudinary.config() to see what it has
console.log("Config:", cloudinary.config());
