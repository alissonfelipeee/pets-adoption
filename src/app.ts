import express from "express";
import { config } from "dotenv";
import { userRoutes } from "./routes/user.routes";
import { petRoutes } from "./routes/pet.routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/users", userRoutes);
app.use("/pets", petRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
