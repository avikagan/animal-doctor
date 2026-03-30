# Animal Doctor

A web browser game where players treat sick animals through puzzle mini-games and learn about endangered species. Endangered animals give higher score multipliers but have harder puzzles.

## Tech Stack
- Vanilla HTML/CSS/JavaScript (ES modules, no build step, no dependencies)
- No server required — fully client-side
- localStorage for save persistence
- Google Fonts (Fredoka One + Nunito)

## Running Locally
```
# Use the no-cache dev server (recommended during development):
python3 server.py
# Open http://localhost:8080

# Or the basic server (may cause caching issues with Safari):
python3 -m http.server 8080
```
**Note:** Safari aggressively caches ES modules. Use `server.py` which sends no-cache headers, or use Develop → Empty Caches after code changes.

## Project Structure
```
index.html              — Single entry point (CSS/JS have ?v=N cache-busting params)
server.py               — Dev server with no-cache headers
css/
  main.css              — Global styles, CSS variables, layout, buttons, badges
  animals.css           — Animal cards, diagnosis hero layout, image sizing
  minigame.css          — Puzzle boards (match pairs, match-3, drag & drop)
  journal.css           — Encyclopedia/journal pages and tabs
  animations.css        — Keyframe animations (bounce, float, sparkle, heal, etc.)
js/
  app.js                — Entry point, loads state and renders main menu
  state.js              — Singleton game state + localStorage persistence
  data/animals.js       — All animal definitions (species, ailments, facts, mini-game configs)
  screens/
    mainMenu.js         — Title screen with play/journal buttons
    animalSelect.js     — Grid of animal cards to choose from
    diagnosis.js        — Hero image + ailment info + "Begin Treatment" button
    minigame.js         — Mini-game dispatcher (routes to correct game type)
    results.js          — Score breakdown with conservation multiplier
    journal.js          — Unlockable encyclopedia (list view + detail view with tabs)
  minigames/
    matchPairs.js       — Memory card-flip matching game
    matchThree.js       — Swap-adjacent match-3 grid with hints and cascades
    dragDrop.js         — Drag treatments onto symptoms (with touch support)
  systems/
    scoring.js          — Score calculation with IUCN conservation multipliers
    timer.js            — Countdown timer class
  utils/
    dom.js              — el() helper, showScreen(), clearElement(), animalImg()
    shuffle.js          — Fisher-Yates shuffle utility
assets/
  images/               — Animal art (PNG + animated GIF per animal)
    honeybee/           — default.png, sick.gif (pending), healthy.gif (pending)
    panda/              — default.png, sick.gif (pending), healthy.gif (pending)
    seaTurtle/          — default.png, sick.gif (pending), healthy.gif (pending)
    snowLeopard/        — default.png, sick.gif (pending), healthy.gif (pending)
    axolotl/            — default.png, sick.gif (pending), healthy.gif (pending)
  svg/                  — (unused, images moved to images/ as PNGs)
  icons/                — (unused)
  audio/                — (unused, sound effects not yet implemented)
```

## Architecture
- Single-page app with screen-based routing via `showScreen()` in `js/utils/dom.js`
- All DOM is built imperatively with the `el()` helper — no framework
- Animal data is the central model in `js/data/animals.js` — add new animals there
- Mini-games implement a common interface: `init()`, `start()`, `destroy()`, and an `onComplete` callback
- Scoring uses IUCN conservation status multipliers (1x–3x) defined in `CONSERVATION_MULTIPLIERS`

## Art System
- Images are custom cute cartoon PNGs with full backgrounds and character names baked in
- Each animal has a folder under `assets/images/{animalId}/` with:
  - `default.png` — static image used in menus, journal, animal select, diagnosis hero
  - `sick.gif` — animated sick state (NOT YET WIRED UP — pending art)
  - `healthy.gif` — animated healthy state (NOT YET WIRED UP — pending art)
- The `animalImg()` helper in `js/utils/dom.js` creates `<img>` elements with emoji fallback on load error
- The diagnosis screen uses a full-width hero image layout (`.diagnosis-hero` in `css/animals.css`)
- Animal IDs must match folder names: `honeybee`, `panda`, `seaTurtle`, `snowLeopard`, `axolotl`

## Key Patterns
- Screens export a `render()` function that clears and rebuilds their DOM section
- Dynamic imports for screen transitions: `import('./screenName.js').then(m => m.render())`
- Timer uses `setInterval` with `Date.now()` delta for accuracy
- Match-3 has hint system (4s timeout), board shuffle on deadlock, and cascade detection
- Match-3 tile types capped at 4 for playability regardless of config
- CSS emoji: use CSS escape syntax (`\26A0`) not JS syntax (`\u26A0`) in `content:` properties

## Animals (5 total)
| ID | Name | IUCN Status | Multiplier | Difficulty |
|----|------|-------------|-----------|-----------|
| honeybee | Bella the Honeybee | Near Threatened | 1.25x | 1 (easiest) |
| panda | Ping the Giant Panda | Vulnerable | 1.5x | 2 |
| seaTurtle | Shelly the Sea Turtle | Endangered | 2.0x | 3 |
| snowLeopard | Storm the Snow Leopard | Vulnerable | 1.5x | 4 |
| axolotl | Axel the Axolotl | Critically Endangered | 3.0x | 5 (hardest) |

Mini-game type is randomly selected each playthrough. Each animal has difficulty-tuned configs for all three game types (`minigameConfigs` in `animals.js`).

## Adding a New Animal
1. Add an entry to the `ANIMALS` array in `js/data/animals.js` with: id, name, species, emoji, conservationStatus, difficulty, ailment (with symptoms, treatments, symptomTreatmentPairs, and wrongTreatments), minigameConfigs (for all three game types), and journal facts
2. Create `assets/images/{id}/default.png` (and optionally sick.gif, healthy.gif)
3. The animal will automatically appear in the selection screen and journal

## Game Flow
```
Main Menu → Animal Selection → Diagnosis (hero image) → Mini-game → Results → Journal unlock
```

## GitHub
- Repo: https://github.com/avikagan/animal-doctor
- Git uses HTTPS via `gh auth setup-git` (SSH keys not configured)
- GitHub Pages not yet enabled

## Pending Work
- Animated GIFs (sick.gif, healthy.gif) for each animal — art is being created
- Wire up sick.gif on diagnosis/minigame screens and healthy.gif on results screen
- Sound effects (audio system not yet implemented)
- GitHub Pages deployment
