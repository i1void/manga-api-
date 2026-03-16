import { load } from "cheerio";
import { fetchApi, extractSlug, formatChapterUrl, cleanThumbnail } from "../utils/fetchPage.js";

const API_URL = "https://api.komiku.org";

export const getBerwarna = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const url = page === 1
      ? `${API_URL}/other/berwarna/`
      : `${API_URL}/other/berwarna/page/${page}/`;

    const html = await fetchApi(url);
    const $ = load(html);
    const results = [];

    $(".bge").each((i, el) => {
      try {
        const mangaUrl = $(el).find(".bgei a").attr("href") || "";
        const slug = extractSlug(mangaUrl);
        const firstChapterEl = $(el).find(".new1 a").first();
        const lastChapterEl = $(el).find(".new1 a").last();

        results.push({
          title: $(el).find("h3").text().trim() || `Manga ${i + 1}`,
          thumbnail: cleanThumbnail($(el).find(".sd").attr("src") || ""),
          type: $(el).find(".tpe1_inf b").text().trim(),
          genre: $(el).find(".tpe1_inf").text().replace($(el).find(".tpe1_inf b").text(), "").trim(),
          slug, url: mangaUrl,
          apiDetailLink: slug ? `/detail-komik/${slug}` : "",
          description: $(el).find(".kan p").text().trim(),
          stats: $(el).find(".judul2").text().trim(),
          firstChapter: firstChapterEl.length ? {
            title: firstChapterEl.attr("title") || "",
            apiLink: formatChapterUrl(firstChapterEl.attr("href")),
          } : null,
          latestChapter: lastChapterEl.length ? {
            title: lastChapterEl.attr("title") || "",
            apiLink: formatChapterUrl(lastChapterEl.attr("href")),
          } : null,
        });
      } catch (e) {
        console.error(`Error parsing berwarna item ${i}:`, e.message);
      }
    });

    res.json({ status: true, page, total: results.length, results });
  } catch (error) {
    console.error("Error getBerwarna:", error.message);
    res.status(500).json({ status: false, error: "Gagal mengambil data berwarna", detail: error.message });
  }
};
