import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak request dari IP ini, silakan coba lagi setelah 15 menit",
  },
});

export default limiter;
