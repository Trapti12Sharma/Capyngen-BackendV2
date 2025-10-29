// index.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

const contactRouter = require("./routes/contact");
const blogRouter = require("./routes/blog");
const careerRouter = require("./routes/career");
const uploadRouter = require("./routes/upload");

const app = express();

// ✅ Connect MongoDB
connectDB();

// ✅ Create uploads dir if not exists
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Swagger docs
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log("Swagger UI available at http://localhost:4000/api-docs");

// ✅ Security
app.use(helmet());

// ✅ CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = (process.env.CORS_ORIGIN || "http://localhost:5173")
        .split(",")
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      console.log("🌍 Incoming request origin:", origin);

      if (!origin || allowed.includes(origin)) {
        console.log(
          "✅ Allowed origin:",
          origin || "server-to-server/no-origin"
        );
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  })
);

// ✅ Body parsers
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Logger
app.use(morgan("dev"));

// ✅ Trust proxy for Render/Heroku etc.
app.set("trust proxy", 1);

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // max requests per window
});
app.use(limiter);

// ✅ Serve uploaded images publicly with CORS headers
// const path = require("path");

// ✅ Serve uploaded images (fixes path issues)
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// ✅ Routes
app.use("/api/upload", uploadRouter);
app.use("/api/contact", contactRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/careers", careerRouter);

// ✅ Root route
app.get("/", (req, res) => res.send("Capyngen backend is up"));

// ✅ Start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
