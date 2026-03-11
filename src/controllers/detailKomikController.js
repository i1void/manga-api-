import { load } from "cheerio";
import { fetchPage } from "../utils/fetchPage.js";

const BASE_URL = "https://komiku.org";

export const getDetailKomik = async (req, res) => {
  try {
    const { slug } = req.params;
    const url = `${BASE_URL}/manga/${slug}/`;
    const html = await fetchPage(url);
    const $ = load(html);

    const title = $("h1 span[itemprop='name']").text().trim();
    const alternativeTitle = $("p.j2").text().trim();
    const description = $("p.desc").text().trim();
    const sinopsis = $("section#Sinopsis p").text().trim();
    const thumbnail = $("section#Informasi div.ims img").attr("src");

    const info = {};
    $("section#Informasi table.inftable tr").each((i, el) => {
      const key = $(el).find("td").first().text().trim();
      const value = $(el).find("td").last().text().trim();
      if (key) info[key] = value;
    });

    const genres = [];
    $("section#Informasi ul.genre li").each((i, el) => {
      genres.push($(el).text().trim());
    });

    // First & Latest chapter
    const firstChapterLink = $("#Judul div.new1:contains('Awal:') a").attr("href");
    const latestChapterLink = $("#Judul div.new1:contains('Terbaru:') a").attr("href");

    const extractChapter = (link) => {
      if (!link) return null;
      const m = link.match(/\/([^/]+)-chapter-([^/]+)\//);
      return m ? { slug: m[1], number: m[2], apiLink: `/baca-chapter/${m[1]}/${m[2]}` } : null;
    };

    const firstChapterInfo = extractChapter(firstChapterLink);
    const latestChapterInfo = extractChapter(latestChapterLink);

    // All chapters
    const chapters = [];
    $("table#Daftar_Chapter tbody tr").each((i, el) => {
      if ($(el).find("th").length > 0) return;
      const chapterTitle = $(el).find("td.judulseries a span").text().trim();
      const chapterLink = $(el).find("td.judulseries a").attr("href");
      const views = $(el).find("td.pembaca i").text().trim();
      const date = $(el).find("td.tanggalseries").text().trim();

      const info = extractChapter(chapterLink);
      chapters.push({
        title: chapterTitle, views, date,
        chapterNumber: info?.number || "",
        originalLink: chapterLink?.startsWith("http") ? chapterLink : chapterLink ? `${BASE_URL}${chapterLink}` : null,
        apiLink: info?.apiLink || null,
      });
    });

    // Similar komik
    const similarKomik = [];
    $("section#Spoiler div.grd").each((i, el) => {
      try {
        const title = $(el).find("div.h4").text().trim();
        const link = $(el).find("a").attr("href");
        let thumbnail = $(el).find("img").attr("src") || "";
        if ($(el).find("img").hasClass("lazy") || thumbnail.includes("lazy.jpg")) {
          thumbnail = $(el).find("img").attr("data-src") || thumbnail;
        }
        const type = $(el).find("div.tpe1_inf b").text().trim();
        const genres = $(el).find("div.tpe1_inf").text().replace(type, "").trim();
        const synopsis = $(el).find("p").text().trim();
        const views = $(el).find("div.vw").text().trim();
        const similarSlug = (link?.match(/\/manga\/([^/]+)/) || [])[1] || "";

        similarKomik.push({
          title, thumbnail, type, genres, synopsis, views, slug: similarSlug,
          originalLink: link?.startsWith("http") ? link : link ? `${BASE_URL}${link}` : null,
          apiDetailLink: similarSlug ? `/detail-komik/${similarSlug}` : null,
        });
      } catch (e) {
        console.error("Error parsing similar komik:", e.message);
      }
    });

    res.json({
      title, alternativeTitle, description, sinopsis, thumbnail, slug,
      info, genres,
      firstChapter: {
        title: $("#Judul div.new1:contains('Awal:') a").text().replace("Awal:", "").trim(),
        originalLink: firstChapterLink?.startsWith("http") ? firstChapterLink : firstChapterLink ? `${BASE_URL}${firstChapterLink}` : null,
        apiLink: firstChapterInfo?.apiLink || null,
        chapterNumber: firstChapterInfo?.number || "",
      },
      latestChapter: {
        title: $("#Judul div.new1:contains('Terbaru:') a").text().replace("Terbaru:", "").trim(),
        originalLink: latestChapterLink?.startsWith("http") ? latestChapterLink : latestChapterLink ? `${BASE_URL}${latestChapterLink}` : null,
        apiLink: latestChapterInfo?.apiLink || null,
        chapterNumber: latestChapterInfo?.number || "",
      },
      chapters, similarKomik,
    });
  } catch (error) {
    console.error("Error getDetailKomik:", error.message);
    res.status(500).json({ error: "Gagal mengambil detail komik", detail: error.message });
  }
};
