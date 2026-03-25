# Animal Doctor

A web browser game where players treat sick animals through puzzle mini-games and learn about endangered species.

## Tech Stack
- Vanilla HTML/CSS/JavaScript (ES modules, no build step, no dependencies)
- No server required — fully client-side
- localStorage for save persistence
- Google Fonts (Fredoka One + Nunito)

## Running Locally
```
python3 -m http.server 8080
# Open http://localhost:8080
```

## Project Structure
```
index.html              — Single entry point
css/                    — Stylesheets (main, animals, minigame, journal, animations)
js/
  app.js                — Entry point, loads state and renders main menu
  state.js              — Singleton game state + localStorage persistence
  data/animals.js       — All animal definitions (species, ailments, facts, configs)
  screens/              — Screen modules (mainMenu, animalSelect, diagnosis, minigame, results, journal)
  minigames/            — Game implementations (matchPairs, matchThree, dragDrop)
  systems/              — Scoring engine and timer
  utils/                — DOM helpers and shuffle utility
assets/                 — SVG art, icons, audio (currently using emoji placeholders)
```

## Architecture
- Single-page app with screen-based routing via `showScreen()` in `js/utils/dom.js`
- All DOM is built imperatively with the `el()` helper — no framework
- Animal data is the central model in `js/data/animals.js` — add new animals there
- Mini-games implement a common interface: `init()`, `start()`, `destroy()`, and an `onComplete` callback
- Scoring uses IUCN conservation status multipliers (1x–3x) defined in `CONSERVATION_MULTIPLIERS`

## Key Patterns
- Screens export a `render()` function that clears and rebuilds their DOM section
- Dynamic imports for screen transitions: `import('./screenName.js').then(m => m.render())`
- Timer uses `setInterval` with `Date.now()` delta for accuracy
- Match-3 has hint system (4s timeout), board shuffle on deadlock, and cascade detection
