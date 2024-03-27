import { config } from "dotenv";

config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
export const MONGODB_URL = process.env.MONGODB_URL;
