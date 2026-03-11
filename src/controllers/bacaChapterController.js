import { load } from "cheerio";
import { fetchPage, extractChapterInfo } from "../utils/fetchPage.js";

const BASE_URL = "https://komiku.org";

export const getBacaChapter = async (req, res) => {
  try {
    const { slug, chapter } = req.params;
    const chapterUrl = `${BASE_URL}/${slug}-chapter-${chapter}/`;
    const html = await fetchPage(chapterUrl);
    const $ = load(html);

    const title = $("#Judul h1").text().trim();
    const mangaTitleEl = $("#Judul p a b");
    const mangaTitle = mangaTitleEl.text().trim();
    const mangaLink = mangaTitleEl.parent().attr("href");
    const mangaSlug = (mangaLink?.match(/\/manga\/([^/]+)/) || [])[1] || "";

    const description =
      $("#Description").first().contents().filter(function () { return this.type === "text"; }).text().trim()
      + " " + $("#Description b").first().text().trim();

    const chapterInfo = {};
    $("#Judul table.tbl tbody tr").each((i, el) => {
      const key = $(el).find("td").first().text().trim();
      const value = $(el).find("td").last().text().trim();
      chapterInfo[key] = value;
    });

    const images = [];
    $("#Baca_Komik img").each((i, el) => {
      const src = $(el).attr("src");
      const id = $(el).attr("id");
      if (
        src && id &&
        (src.includes("komiku.org/upload") ||
          src.includes("cdn.komiku.org/upload") ||
          src.includes("img.komiku.org/upload"))
      ) {
        images.push({
          src,
          alt: $(el).attr("alt"),
          id,
          fallbackSrc: src.replace("cdn.komiku.id", "img.komiku.id"),
        });
      }
    });

    const totalImages = $(".chapterInfo").attr("valuegambar") || images.length.toString();
    const publishDate = $("time[property='datePublished']").attr("datetime") || $("time").first().text().trim();

    // Prev / Next chapter
    let prevChapterLink = $(".nxpr a.rl[href*='-chapter-']").attr("href") || "";
    let nextChapterLink = $(".nxpr a.rr[href*='-chapter-']").attr("href") || "";

    if (!nextChapterLink) {
      $(".nxpr a[href*='-chapter-']").each((i, el) => {
        const href = $(el).attr("href");
        if (href !== prevChapterLink) { nextChapterLink = href; return false; }
      });
    }

    res.json({
      title,
      mangaInfo: {
        title: mangaTitle,
        slug: mangaSlug,
        originalLink: mangaLink?.startsWith("http") ? mangaLink : mangaLink ? `${BASE_URL}${mangaLink}` : null,
        apiLink: mangaSlug ? `/detail-komik/${mangaSlug}` : null,
      },
      description: description.trim(),
      chapterInfo,
      images,
      meta: {
        chapterNumber: chapter,
        totalImages: parseInt(totalImages) || 0,
        publishDate,
        slug,
      },
      navigation: {
        prevChapter: extractChapterInfo(prevChapterLink),
        nextChapter: extractChapterInfo(nextChapterLink),
        allChapters: mangaSlug ? `/detail-komik/${mangaSlug}` : null,
      },
    });
  } catch (error) {
    console.error("Error getBacaChapter:", error.message);
    res.status(500).json({ error: "Gagal mengambil chapter", detail: error.message });
  }
};
