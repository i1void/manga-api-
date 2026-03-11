import express from "express";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes.js";
import rateLimiter from "./middleware/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 3000;

process.on("uncaughtException", (err) => console.error("Uncaught Exception:", err));
process.on("unhandledRejection", (reason) => console.error("Unhandled Rejection:", reason));

app.use(cors());
app.use(express.json());
app.set("json spaces", 2);
app.use(rateLimiter);

app.get("/", (req, res) => {
  res.json({
    message: "Komiku API",
    version: "1.0.0",
    endpoints: [
      "GET /api/terbaru",
      "GET /api/rekomendasi",
      "GET /api/komik-populer",
      "GET /api/komik-populer/manga",
      "GET /api/komik-populer/manhwa",
      "GET /api/komik-populer/manhua",
      "GET /api/pustaka",
      "GET /api/pustaka/page/:page",
      "GET /api/genre-all",
      "GET /api/genre-rekomendasi",
      "GET /api/genre/:slug",
      "GET /api/genre/:slug/page/:page",
      "GET /api/search?q=keyword",
      "GET /api/detail-komik/:slug",
      "GET /api/baca-chapter/:slug/:chapter",
      "GET /api/berwarna",
      "GET /api/berwarna/page/:page",
    ],
  });
});

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
