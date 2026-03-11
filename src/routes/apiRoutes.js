import express from "express";
import { getTerbaru } from "../controllers/terbaruController.js";
import { getRekomendasi } from "../controllers/rekomendasiController.js";
import { getKomikPopuler, getMangaPopuler, getManhwaPopuler, getManhuaPopuler } from "../controllers/komikPopulerController.js";
import { getPustaka } from "../controllers/pustakaController.js";
import { getGenreAll, getGenreRekomendasi, getGenreDetail } from "../controllers/genreController.js";
import { getSearch } from "../controllers/searchController.js";
import { getDetailKomik } from "../controllers/detailKomikController.js";
import { getBacaChapter } from "../controllers/bacaChapterController.js";
import { getBerwarna } from "../controllers/berwarnaController.js";

const router = express.Router();

// Home
router.get("/terbaru", getTerbaru);
router.get("/rekomendasi", getRekomendasi);

// Komik Populer
router.get("/komik-populer", getKomikPopuler);
router.get("/komik-populer/manga", getMangaPopuler);
router.get("/komik-populer/manhwa", getManhwaPopuler);
router.get("/komik-populer/manhua", getManhuaPopuler);

// Pustaka
router.get("/pustaka", getPustaka);
router.get("/pustaka/page/:page", getPustaka);

// Genre
router.get("/genre-all", getGenreAll);
router.get("/genre-rekomendasi", getGenreRekomendasi);
router.get("/genre/:slug", getGenreDetail);
router.get("/genre/:slug/page/:page", getGenreDetail);

// Search
router.get("/search", getSearch);

// Detail & Chapter
router.get("/detail-komik/:slug", getDetailKomik);
router.get("/baca-chapter/:slug/:chapter", getBacaChapter);

// Berwarna
router.get("/berwarna", getBerwarna);
router.get("/berwarna/page/:page", getBerwarna);

export default router;
