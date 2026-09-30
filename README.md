# Democracy This Week

A Sunday election show, and the public site that publishes its briefs.

| Folder | What it is |
| --- | --- |
| [content](content) | The show. Weekend rundowns, episode briefs, and how governments are structured. Markdown only. |
| [website](website) | The site that gets hosted. Countries, elections, and the published briefs. |

The show is planned in `content`. When a brief is ready, copy `content/episodes` and `content/structures` into `website/public/content`, and add any new filename to `website/public/content/manifest.json`.

From `website`:

```bash
npm start
npm run build
npm run fortnight
```

`npm start` serves the site at http://localhost:4200. `npm run build` writes a static site to `website/dist/democracy-this-week`.
