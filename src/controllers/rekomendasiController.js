import { load } from "cheerio";
import { fetchPage, cleanThumbnail } from "../utils/fetchPage.js";

const BASE_URL = "https://komiku.org";

export const getRekomendasi = async (req, res) => {
  try {
    const html = await fetchPage(`${BASE_URL}/`);
    const $ = load(html);
    const results = [];

    $("#Rekomendasi_Komik article.ls2").each((i, el) => {
      const anchorTag = $(el).find("a").first();
      const imgTag = $(el).find("img");

      const title = (imgTag.attr("alt") || $(el).find(".ls2j h3 a").text())
        ?.replace(/^Baca (Komik|Manga|Manhwa|Manhua)\s+/i, "").trim();

      const originalLinkPath = anchorTag.attr("href");
      const originalLink = originalLinkPath?.startsWith("http")
        ? originalLinkPath
        : originalLinkPath ? `${BASE_URL}${originalLinkPath}` : null;

      const thumbnail = cleanThumbnail(imgTag.attr("data-src") || imgTag.attr("src"));

      let slug = "";
      if (originalLinkPath) {
        const m = originalLinkPath.match(/\/manga\/([^/]+)/);
        if (m) slug = m[1];
      }

      if (title && thumbnail) {
        results.push({
          title, originalLink, thumbnail, slug,
          apiDetailLink: slug ? `/detail-komik/${slug}` : null,
        });
      }
    });

    res.json(results);
  } catch (error) {
    console.error("Error getRekomendasi:", error.message);
    res.status(500).json({ error: "Gagal mengambil rekomendasi", detail: error.message });
  }
};
