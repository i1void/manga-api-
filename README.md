# MangaAPI

> RESTful API for scraping manga, manhwa, and manhua data from [Komiku.org](https://komiku.org).

## Stack

Node.js · Express.js · Axios · Cheerio · Vercel

## Setup

```bash
git clone https://github.com/yourusername/komiku-api.git
cd komiku-api
npm install
npm run dev
```

## Endpoints

Base URL: `http://localhost:3000/api`

| Endpoint | Description |
|----------|-------------|
| `GET /terbaru` | Latest updated comics |
| `GET /rekomendasi` | Recommended comics |
| `GET /komik-populer` | All popular comics |
| `GET /komik-populer/manga` | Popular manga |
| `GET /komik-populer/manhwa` | Popular manhwa |
| `GET /komik-populer/manhua` | Popular manhua |
| `GET /pustaka` | Comic library |
| `GET /pustaka/page/:page` | Library with pagination |
| `GET /genre-all` | All genres |
| `GET /genre-rekomendasi` | Recommended genres |
| `GET /genre/:slug` | Comics by genre |
| `GET /genre/:slug/page/:page` | Comics by genre with pagination |
| `GET /search?q=keyword` | Search comics |
| `GET /detail-komik/:slug` | Comic detail & chapter list |
| `GET /baca-chapter/:slug/:chapter` | Read a chapter |
| `GET /berwarna` | Colored comics |
| `GET /berwarna/page/:page` | Colored comics with pagination |

## Rate Limiting

200 requests per IP per 15 minutes.

## Deploy

```bash
npm i -g vercel
vercel
```
