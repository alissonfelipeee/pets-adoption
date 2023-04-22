import express from "express";
import { config } from "dotenv";
import { router } from "./routes/router";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
