import { load } from "cheerio";
import { fetchPage } from "../utils/fetchPage.js";
import axios from "axios";
import { getRandomUserAgent } from "../utils/fetchPage.js";

const BASE_URL = "https://komiku.org";

function parseResults($, results) {
  $(".bge").each((i, el) => {
    try {
      const bgei = $(el).find(".bgei");
      const kan = $(el).find(".kan");

      const mangaLink = bgei.find("a").attr("href") || "";
      const slug = mangaLink.replace("/manga/", "").replace(/\/$/, "");
      const thumbnail = kan.find("img").attr("src") || bgei.find("img").attr("src") || "";
      const title = kan.find("h3").text().trim();
      const altTitle = kan.find(".judul2").text().trim();
      const description = kan.find("p").text().trim();
      const type = bgei.find(".tpe1_inf b").text().trim();
      const genre = bgei.find(".tpe1_inf").text().replace(type, "").trim();

      results.push({
        title,
        altTitle: altTitle || null,
        slug,
        thumbnail,
        type,
        genre: genre || null,
        description,
        apiDetailLink: `/detail-komik/${slug}`,
      });
    } catch (err) {
      console.error("Error parsing item:", err.message);
    }
  });
}

export const getSearch = async (req, res) => {
  const keyword = req.query.q;
  if (!keyword) return res.status(400).json({ error: "Parameter q wajib diisi" });

  try {
    const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(keyword)}&post_type=manga`;
    const html = await fetchPage(searchUrl);
    const $ = load(html);
    let results = [];

    // Try HTMX method first
    const htmxElement = $(".daftar span[hx-get]");
    if (htmxElement.length > 0) {
      const htmxUrl = htmxElement.attr("hx-get");
      if (htmxUrl) {
        try {
          const htmxRes = await axios.get(htmxUrl, {
            headers: {
              "User-Agent": getRandomUserAgent(),
              Accept: "text/html",
              "HX-Request": "true",
              Referer: searchUrl,
            },
            timeout: 10000,
          });
          const $htmx = load(htmxRes.data);
          if ($htmx(".bge").length > 0) parseResults($htmx, results);
        } catch (e) {
          console.error("HTMX error:", e.message);
        }
      }
    }

    if (results.length === 0) parseResults($, results);

    res.json({
      status: true,
      keyword,
      total: results.length,
      message: results.length > 0 ? "Berhasil mendapatkan hasil pencarian" : "Tidak ada hasil ditemukan",
      results,
    });
  } catch (error) {
    console.error("Error getSearch:", error.message);
    res.status(500).json({ error: "Gagal mencari komik", detail: error.message });
  }
};
