# Democracy This Week

This folder is the public site. It is what gets hosted.

```bash
npm start
npm run build
```

`npm start` serves the site at http://localhost:4200. `npm run build` writes a static site to `dist/democracy-this-week`.

The pages read `public/data` and `public/content`. Countries, elections, and regime notes are kept here, in `public/data`. `public/content/manifest.json` lists the episode and structure files the site loads.

The weekly show plans are in [content](../content). When a brief is ready, copy `episodes` and `structures` from there into `public/content`, and add any new filename to `public/content/manifest.json`.

From this folder, the elections already on file for the next 14 days:

```bash
npm run fortnight
```
