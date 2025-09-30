// index.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

const contactRouter = require("./routes/contact");
const blogRouter = require("./routes/blog");
const careerRouter = require("./routes/career");

const app = express();

// create uploads dir if not exists
const uploadDir = process.env.UPLOAD_DIR || "./uploads";

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

console.log("Swagger UI available at http://localhost:4000/api-docs");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:4000", // ✅ allow Swagger UI locally
      "https://capyngen.com", // ✅ production frontend
      "https://capyngen-backendv2.onrender.com", // ✅ deployed backend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ include OPTIONS
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

// Handle preflight
app.options("*", cors());

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use("/api/contact", contactRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/careers", careerRouter);

app.get("/", (req, res) => res.send("Capyngen backend is up"));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
