import { load } from "cheerio";
import { fetchPage, fetchApi, cleanThumbnail } from "../utils/fetchPage.js";

const BASE_URL = "https://komiku.org";
const API_URL = "https://api.komiku.org";

export const getGenreAll = async (req, res) => {
  try {
    const html = await fetchPage(`${BASE_URL}/`);
    const $ = load(html);
    const genres = [];

    $("ul.genre li").each((i, el) => {
      const a = $(el).find("a");
      const title = a.text().trim();
      const href = a.attr("href");
      const titleAttr = a.attr("title");
      const slug = (href?.match(/\/genre\/([^/]+)/) || [])[1] || "";

      const finalLink = href?.startsWith("http") ? href : href ? `${BASE_URL}${href}` : null;

      if (title && href) {
        genres.push({
          title, slug, titleAttr: titleAttr || title,
          originalLink: finalLink,
          apiLink: slug ? `/genre/${slug}` : href,
        });
      }
    });

    res.json(genres);
  } catch (error) {
    console.error("Error getGenreAll:", error.message);
    res.status(500).json({ error: "Gagal mengambil genre", detail: error.message });
  }
};

export const getGenreRekomendasi = async (req, res) => {
  try {
    const html = await fetchPage(`${BASE_URL}/`);
    const $ = load(html);
    const results = [];

    $(".ls3").each((i, el) => {
      const anchorTag = $(el).find("a").first();
      const imgTag = $(el).find("img");
      const title = $(el).find(".ls3p h4").text().trim();
      const readLinkPath = $(el).find(".ls3p a").attr("href");
      const originalLinkPath = anchorTag.attr("href");

      const thumbnail = cleanThumbnail(imgTag.attr("src") || imgTag.attr("data-src"));

      let slug = "";
      if (originalLinkPath) {
        const m = originalLinkPath.match(/\/genre\/([^/]+)/)
          || originalLinkPath.match(/\/(other|statusmanga)\/([^/]+)/);
        if (m) slug = m[2] || m[1];
      }

      const originalLink = originalLinkPath?.startsWith("http")
        ? originalLinkPath : originalLinkPath ? `${BASE_URL}${originalLinkPath}` : null;
      const readLink = readLinkPath?.startsWith("http")
        ? readLinkPath : readLinkPath ? `${BASE_URL}${readLinkPath}` : null;

      if (title && thumbnail) {
        results.push({
          title, slug, thumbnail, originalLink, readLink,
          apiLink: slug ? `/genre/${slug}` : originalLinkPath,
        });
      }
    });

    res.json(results);
  } catch (error) {
    console.error("Error getGenreRekomendasi:", error.message);
    res.status(500).json({ error: "Gagal mengambil genre rekomendasi", detail: error.message });
  }
};

export const getGenreDetail = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.params.page) || 1;
    const url = `${API_URL}/genre/${slug}/page/${page}/`;

    const html = await fetchApi(url);
    const $ = load(html);
    const results = [];

    $(".bge").each((i, el) => {
      const mangaLink = $(el).find(".bgei a").attr("href") || "";
      const mangaSlug = (mangaLink.match(/\/manga\/([^/]+)/) || [])[1] || "";

      const thumbnail = cleanThumbnail(
        $(el).find(".bgei img").attr("src") || $(el).find(".bgei img").attr("data-src") || ""
      );

      const title = $(el).find(".kan h3").text().trim();
      const type = $(el).find(".tpe1_inf b").text().trim();
      const genre = $(el).find(".tpe1_inf").text().replace(type, "").trim();
      const description = $(el).find(".kan p").text().trim();
      const additionalInfo = $(el).find(".judul2").text().trim();
      const updateStatus = $(el).find(".up").text().trim();

      const chapterEls = $(el).find(".new1 a");
      let firstChapter = null, latestChapter = null;

      if (chapterEls.length >= 1) {
        const el1 = $(chapterEls[0]);
        const href = el1.attr("href");
        firstChapter = {
          chapter: el1.find("span").last().text().trim(),
          originalLink: href?.startsWith("http") ? href : href ? `${BASE_URL}${href}` : null,
          apiLink: href ? `/chapter${href}` : null,
        };
      }
      if (chapterEls.length >= 2) {
        const el2 = $(chapterEls[1]);
        const href = el2.attr("href");
        const chNum = (href?.match(/-chapter-([\d.]+)\/?$/i) || [])[1] || "";
        latestChapter = {
          chapter: el2.find("span").last().text().trim(),
          originalLink: href?.startsWith("http") ? href : href ? `${BASE_URL}${href}` : null,
          apiLink: mangaSlug && chNum ? `/baca-chapter/${mangaSlug}/${chNum}` : null,
        };
      }

      if (title && thumbnail) {
        results.push({
          title, slug: mangaSlug, type, genre, thumbnail,
          description, additionalInfo, updateStatus,
          apiDetailLink: mangaSlug ? `/detail-komik/${mangaSlug}` : null,
          chapters: { first: firstChapter, latest: latestChapter },
        });
      }
    });

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Tidak ada manga ditemukan",
        genre: slug, page,
      });
    }

    res.json({
      success: true,
      genre: slug,
      page,
      total: results.length,
      hasNextPage: results.length >= 10,
      nextPage: results.length >= 10 ? `/genre/${slug}/page/${page + 1}` : null,
      results,
    });
  } catch (error) {
    console.error("Error getGenreDetail:", error.message);
    res.status(500).json({ error: "Gagal mengambil genre detail", detail: error.message });
  }
};
