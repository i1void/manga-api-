import { load } from "cheerio";
import { fetchApi, extractSlug, formatChapterUrl } from "../utils/fetchPage.js";

const API_URL = "https://api.komiku.org";

export const getPustaka = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const html = await fetchApi(`${API_URL}/manga/page/${page}/`);
    const $ = load(html);
    const results = [];

    $(".bge").each((i, el) => {
      const url = $(el).find(".bgei a").attr("href") || "";
      const slug = extractSlug(url);
      const firstChapterEl = $(el).find(".new1 a[title*='Chapter']").first();
      const lastChapterEl = $(el).find(".new1 a[title*='Chapter']").last();

      results.push({
        title: $(el).find(".kan h3").text().trim(),
        thumbnail: $(el).find(".bgei img").attr("src") || "",
        type: $(el).find(".tpe1_inf b").text().trim(),
        genre: $(el).find(".tpe1_inf").text().replace($(el).find(".tpe1_inf b").text(), "").trim(),
        slug, url,
        apiDetailLink: slug ? `/detail-komik/${slug}` : null,
        description: $(el).find(".kan p").text().trim(),
        stats: $(el).find(".judul2").text().trim(),
        firstChapter: firstChapterEl.length ? {
          title: firstChapterEl.attr("title"),
          apiLink: formatChapterUrl(firstChapterEl.attr("href")),
        } : null,
        latestChapter: lastChapterEl.length ? {
          title: lastChapterEl.attr("title"),
          apiLink: formatChapterUrl(lastChapterEl.attr("href")),
        } : null,
      });
    });

    res.json({ page, total: results.length, results });
  } catch (error) {
    console.error("Error getPustaka:", error.message);
    res.status(500).json({ error: "Gagal mengambil pustaka", detail: error.message });
  }
};
