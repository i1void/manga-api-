import axios from "axios";

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
];

export const getRandomUserAgent = () =>
  userAgents[Math.floor(Math.random() * userAgents.length)];

export const getRandomDelay = () =>
  Math.floor(Math.random() * (3000 - 1000 + 1) + 1000);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const cleanThumbnail = (url) => {
  if (!url) return "";
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
};

export const fetchPage = async (url, config = {}) => {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Referer: "https://komiku.org/",
        Origin: "https://komiku.org",
        ...config.headers,
      },
      timeout: 15000,
      ...config,
    });
    await delay(500);
    return response.data;
  } catch (error) {
    console.error(`Error fetching URL: ${url}`, error.message);
    throw error;
  }
};

export const fetchApi = async (url, config = {}) => {
  try {
    await delay(getRandomDelay());
    const response = await axios.get(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "max-age=0",
        Referer: "https://komiku.org/",
        ...config.headers,
      },
      timeout: 15000,
      maxRedirects: 5,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching API URL: ${url}`, error.message);
    throw error;
  }
};

export const extractSlug = (url) => {
  if (!url || typeof url !== "string") return "";
  const matches = url.match(/\/manga\/(.*?)\//);
  return matches ? matches[1] : "";
};

export const formatChapterUrl = (url) => {
  if (!url) return null;
  const match = url.match(/\/([^/]+)-chapter-(\d+[.\d]*)/);
  if (match) return `/baca-chapter/${match[1]}/${match[2]}`;
  return url;
};

export const extractChapterInfo = (url) => {
  if (!url) return null;
  const m = url.match(/\/([^/]+)-chapter-([^/]+)\//);
  if (m) return { slug: m[1], chapter: m[2], apiLink: `/baca-chapter/${m[1]}/${m[2]}`, originalLink: url };
  return null;
};
