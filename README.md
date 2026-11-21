# Vice City Trophy Atlas

![gta6-trophy-guide-01](badge/gta6-trophy-guide-01.svg)
![Rank](badge/gta6-trophy-guide-01/Darkarmy921/gta6-trophy-guide/rank.svg)
![Reward](badge/gta6-trophy-guide-01/Darkarmy921/gta6-trophy-guide/reward.svg)

The complete offline guide and tracker for the **55 PlayStation 5 trophies of Grand Theft Auto VI** — official names, descriptions and grades, with a cited guide for every trophy.

## What it is

- **Every trophy, exactly as published:** all 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze) with PlayStation's exact name, description and grade.
- **A tracker:** a checklist saved in the browser (localStorage), with export to a file and import back, filters by kind (story, missable, collectibles, activities, online) and by grade, text search, and per-grade progress counts (x/55).
- **Spoiler-safe mode:** hides the names *and* descriptions of story trophies until they are earned.
- **A roadmap to the platinum:** six stages built only from the official descriptions — story chapters in order, then side characters and strangers, then collectibles and exploration, then activities, then money and 100% cleanup.
- **Missable flags:** every trophy tied to a named story mission, a character's final mission, or a one-off choice or event is flagged, with the derivation explained in the app. PlayStation does not confirm any trophy permanently missable, and the guide says so.
- **Cited guidance:** each trophy's detail view shows its guide in the author's own words with its sources beside it (PlayStation's official list, Exophase, PSNProfiles). Where a step or count is not stated in the official description, the guide says so instead of inventing it.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. The app is static files under `app/` and works with the network off: it loads nothing over the network, uses no cookies and no service worker, and uses no Rockstar logo, artwork or game screenshots.

## Build the hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`.

## Files

- `app/index.html` — the guide's page: progress card, filters, checklist, detail panel, roadmap and missable views.
- `app/style.css` — the dark Vice-City-neon look, drawn with CSS only.
- `app/app.js` — checklist, progress, spoiler mode, export/import, detail view.
- `app/filters.js` — kind/grade/search filtering, spoiler-safe names and descriptions, per-grade counts.
- `app/roadmap.js` — the six-stage platinum roadmap and the missable list, built from the trophy data.
- `app/data/trophies.json` — the 55 official trophies with exact name/description/grade, plus each trophy's own-words guide, sources, kind, missable flag and roadmap stage.
- `main.ts` — the hand-in program (Node 22, standard library only).
- `serve.ts` — a tiny static server for local testing.
- `screenshots/` — four real renders of the app (see `shots.json`).

## License

MIT — see `LICENSE`.
