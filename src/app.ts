import express from "express";
import { config } from "dotenv";
import { userRoutes } from "./routes/user.routes";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/users", userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
