import { load } from "cheerio";
import { fetchPage, cleanThumbnail } from "../utils/fetchPage.js";

const BASE_URL = "https://komiku.org";

function scrapeSection($, sectionId) {
  const items = [];
  const sectionTitle = $(`${sectionId} h2.lsh3`).text().trim();

  $(`${sectionId} article.ls2`).each((i, el) => {
    const linkEl = $(el).find(".ls2v > a").first();
    const imgEl = linkEl.find("img");
    const detailEl = $(el).find(".ls2j");

    let title = imgEl.attr("alt")?.replace(/^Baca (Manga|Manhwa|Manhua|Komik)\s+/i, "").trim()
      || detailEl.find("h3 a").text().trim();

    const originalLinkPath = linkEl.attr("href");
    const originalLink = originalLinkPath?.startsWith("http")
      ? originalLinkPath
      : originalLinkPath ? `${BASE_URL}${originalLinkPath}` : null;

    const thumbnail = cleanThumbnail(imgEl.attr("data-src") || imgEl.attr("src"));
    const infoText = detailEl.find(".ls2t").text().trim();

    let genre = "", readers = "";
    const m = infoText.match(/(.+?)\s+([\d.,]+[mjkrb龕万KMBT]?\s*pembaca)$/i);
    if (m) { genre = m[1].trim(); readers = m[2].trim(); }
    else genre = infoText;

    const latestChapter = detailEl.find("a.ls2l").text().trim();
    const chapterLinkPath = detailEl.find("a.ls2l").attr("href");
    const originalChapterLink = chapterLinkPath?.startsWith("http")
      ? chapterLinkPath
      : chapterLinkPath ? `${BASE_URL}${chapterLinkPath}` : null;

    let slug = "";
    if (originalLinkPath) {
      const sm = originalLinkPath.match(/\/manga\/([^/]+)/);
      if (sm) slug = sm[1];
    }

    let chapterNumber = "";
    if (chapterLinkPath) {
      const cm = chapterLinkPath.match(/-chapter-([\d.]+)\/?$/i)
        || chapterLinkPath.match(/\/([\d.]+)\/?$/i);
      if (cm) chapterNumber = cm[1];
      else {
        const tm = latestChapter.match(/Chapter\s*([\d.]+)/i);
        if (tm) chapterNumber = tm[1];
      }
    }

    if (title && thumbnail && originalLink) {
      items.push({
        title, originalLink, thumbnail, genre, readers,
        latestChapter, originalChapterLink, slug, chapterNumber,
        apiDetailLink: slug ? `/detail-komik/${slug}` : null,
        apiChapterLink: slug && chapterNumber ? `/baca-chapter/${slug}/${chapterNumber}` : null,
      });
    }
  });

  return { title: sectionTitle, items };
}

export const getKomikPopuler = async (req, res) => {
  try {
    const html = await fetchPage(`${BASE_URL}/`);
    const $ = load(html);
    res.json({
      manga: scrapeSection($, "#Komik_Hot_Manga"),
      manhwa: scrapeSection($, "#Komik_Hot_Manhwa"),
      manhua: scrapeSection($, "#Komik_Hot_Manhua"),
    });
  } catch (error) {
    console.error("Error getKomikPopuler:", error.message);
    res.status(500).json({ error: "Gagal mengambil komik populer", detail: error.message });
  }
};

export const getMangaPopuler = async (req, res) => {
  try {
    const html = await fetchPage(`${BASE_URL}/`);
    const $ = load(html);
    res.json(scrapeSection($, "#Komik_Hot_Manga"));
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil manga populer", detail: error.message });
  }
};

export const getManhwaPopuler = async (req, res) => {
  try {
    const html = await fetchPage(`${BASE_URL}/`);
    const $ = load(html);
    res.json(scrapeSection($, "#Komik_Hot_Manhwa"));
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil manhwa populer", detail: error.message });
  }
};

export const getManhuaPopuler = async (req, res) => {
  try {
    const html = await fetchPage(`${BASE_URL}/`);
    const $ = load(html);
    res.json(scrapeSection($, "#Komik_Hot_Manhua"));
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil manhua populer", detail: error.message });
  }
};
