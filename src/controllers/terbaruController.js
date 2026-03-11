import { load } from "cheerio";
import { fetchPage } from "../utils/fetchPage.js";

const BASE_URL = "https://komiku.org";

export const getTerbaru = async (req, res) => {
  try {
    const html = await fetchPage(`${BASE_URL}/`);
    const $ = load(html);
    const results = [];

    $("#Terbaru div.ls4w article.ls4").each((i, el) => {
      const element = $(el);
      const linkElement = element.find(".ls4v > a").first();
      const imgElement = linkElement.find("img");
      const detailElement = element.find(".ls4j");

      const titleFromH3 = detailElement.find("h3 > a").text().trim();
      const titleFromAlt = imgElement.attr("alt")?.replace(/^Baca (Manga|Manhwa|Manhua)\s+/i, "").trim();
      const title = titleFromH3 || titleFromAlt || "Judul Tidak Tersedia";

      const originalLinkPath = linkElement.attr("href");
      const originalLink = originalLinkPath?.startsWith("http")
        ? originalLinkPath
        : originalLinkPath ? `${BASE_URL}${originalLinkPath}` : null;

      let thumbnail = imgElement.attr("data-src") || imgElement.attr("src");

      const typeGenreTimeString = detailElement.find("span.ls4s").text().trim();
      let type = "Unknown", genre = "Unknown", updateTime = "Unknown";

      const typeMatch = typeGenreTimeString.match(/^(Manga|Manhwa|Manhua)/i);
      if (typeMatch) {
        type = typeMatch[0];
        const rest = typeGenreTimeString.substring(type.length).trim();
        const timeMatch = rest.match(/(.+?)\s+([\d\w\s]+lalu)$/i);
        if (timeMatch) { genre = timeMatch[1].trim(); updateTime = timeMatch[2].trim(); }
        else genre = rest;
      }

      const latestChapterTitle = detailElement.find("a.ls24").text().trim();
      const latestChapterLinkPath = detailElement.find("a.ls24").attr("href");
      const latestChapterLink = latestChapterLinkPath?.startsWith("http")
        ? latestChapterLinkPath
        : latestChapterLinkPath ? `${BASE_URL}${latestChapterLinkPath}` : null;

      const isColored = element.find(".ls4v span.warna").length > 0;
      const updateCountText = element.find(".ls4v span.up").text().trim();

      let slug = "";
      if (originalLinkPath) {
        const m = originalLinkPath.match(/\/manga\/([^/]+)/);
        if (m) slug = m[1];
      }

      let apiChapterLink = null;
      if (latestChapterLinkPath && slug) {
        const m = latestChapterLinkPath.match(/-chapter-([\d.]+)\/?$/i);
        if (m) apiChapterLink = `/baca-chapter/${slug}/${m[1]}`;
      }

      if (title && title !== "Judul Tidak Tersedia" && thumbnail && originalLink) {
        results.push({
          title, originalLink, thumbnail, type, genre, updateTime,
          latestChapterTitle, latestChapterLink,
          isColored, updateCountText, slug,
          apiDetailLink: slug ? `/detail-komik/${slug}` : null,
          apiChapterLink,
        });
      }
    });

    res.json(results);
  } catch (error) {
    console.error("Error getTerbaru:", error.message);
    res.status(500).json({ error: "Gagal mengambil data terbaru", detail: error.message });
  }
};
