import express, { json } from "express"
import dotenv from "dotenv"

import { sequelize } from "./config/database"

import authRoutes from "./routes/authRoutes"
import auth from "./middlewares/auth"
import eventRoutes from "./routes/eventRoutes"

dotenv.config();

const app = express()

app.use(json());
// app.use(auth);

app.use("/auth", authRoutes)
app.use("/event", eventRoutes)


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sequelize.authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Unable to connect to the database:', err));
});

