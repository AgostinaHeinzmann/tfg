import admin, { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const SERVICE_ACCOUNT_KEY = JSON.parse(
  Buffer.from(process.env.SERVICE_ACCOUNT_KEY!, 'base64').toString('utf-8')
);


admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT_KEY),
});

export default admin;