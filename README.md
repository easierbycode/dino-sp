# 🦕 Dino Runner — svelte-phaser edition

A port of [dino](https://github.com/easierbycode/dino) (vanilla canvas dino
runner with a global leaderboard) to
[5velte-ph4ser](https://github.com/easierbycode/svelte-phaser) —
Svelte 5 components and hooks for Phaser 4 — running on
[Deno Deploy](https://deno.com/deploy).

Jump over cacti, beat your high score, customize your dino, and compete on a
global PostgreSQL-backed leaderboard.

## Architecture

| Layer | Stack | Where |
| --- | --- | --- |
| Game + UI | Svelte 5 (runes) + Phaser 4 via **5velte-ph4ser**, built with Vite | [client/](client/) |
| API + static server | Deno + Oak + `pg` (PostgreSQL / Neon) | [src/](src/) |

The entire game simulation — physics, spawning, scoring, difficulty — is a
plain reactive state class ([client/lib/game.svelte.ts](client/lib/game.svelte.ts)),
stepped once per Phaser game step. The scene is *declared* from that state
with 5velte-ph4ser components:

```svelte
<Game width={800} height={200} parent={frame} transparent={true}>
  <Scene key="dino">
    <Rectangle ... />                     <!-- ground line -->
    {#each game.obstacles as obstacle (obstacle.id)}
      <Obstacle {obstacle} />             <!-- cactus containers -->
    {/each}
    <Dino {game} />                       <!-- dino container -->
    {#if game.status === 'gameOver'} ... {/if}
  </Scene>
</Game>
```

The Oak server serves the built client from `dist/` and exposes the same API
as the original: `/api/health`, `/api/leaderboard`, `/api/scores`,
`/api/customization`.

## Fullscreen

The game scales with Phaser's `Scale.FIT` and can go fullscreen — click the
⛶ button in the HUD or press <kbd>F</kbd>. The HUD lives inside the
fullscreened element so score/status stay visible, and the theme's sky/ground
gradient is recomputed to line up with the letterboxed canvas.

## Gamepad + codemonkey.json

Plug in a controller and the UI adapts: a 🎮 chip appears in the HUD, the
Controls panel gains a gamepad column, and the in-game hint shows the mapped
button. Button → action mapping is loaded from
[public/codemonkey.json](public/codemonkey.json):

```json
{
  "gamepad": {
    "buttons": {
      "FACE_BOTTOM": "jump"
    }
  }
}
```

- **Buttons** (standard mapping): `FACE_BOTTOM` (A/✕), `FACE_RIGHT` (B/○),
  `FACE_LEFT` (X/□), `FACE_TOP` (Y/△), `L1`, `R1`, `L2`, `R2`, `SELECT`,
  `START`, `L3`, `R3`, `DPAD_UP`, `DPAD_DOWN`, `DPAD_LEFT`, `DPAD_RIGHT`
- **Actions**: `jump`, `fullscreen` (note: browsers may reject fullscreen
  requests that don't come from a mouse/keyboard gesture)

The file is fetched at runtime, so edits apply on reload — no rebuild needed.

## Development

Requires [Deno](https://deno.com) 2.x. The client toolchain (Vite, Svelte,
Phaser, [5velte-ph4ser](https://www.npmjs.com/package/5velte-ph4ser)) is
installed from [package.json](package.json) into `node_modules`. The
`5velte-ph4ser` package ships raw Svelte/TS source and is compiled by this
app's Vite + Svelte toolchain. To iterate on the library locally, point the
dependency at a checkout (`"5velte-ph4ser": "file:../svelte-phaser"`) and
reinstall.

```sh
cp .env.example .env       # then fill in DATABASE_URL (Neon works great)
deno install --allow-scripts

# terminal 1 — API server on :8004
deno task dev:server

# terminal 2 — Vite dev server (proxies /api to :8004)
deno task dev
```

If `deno install` gives you trouble, `npm install` produces the same
`node_modules`.

## Production / Deno Deploy

```sh
deno task build            # vite build → dist/
deno task start            # Oak serves dist/ + API on PORT (default 8004)
```

Deploy with [deployctl](https://docs.deno.com/deploy/manual/deployctl/) — the
`deploy` config in [deno.json](deno.json) points at `src/main.ts` and includes
`dist/`, so build first:

```sh
deno task build
deployctl deploy
```

Set `DATABASE_URL` in the Deno Deploy project's environment variables. Without
a database the server still runs — scores and customization just don't
persist.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8004` | server port |
| `HOST` | `localhost` | logged hostname |
| `DATABASE_URL` | — | PostgreSQL connection string (Neon, etc.) |
| `PGHOST`/`PGUSER`/… | — | standard PG vars (used when `DATABASE_URL` is unset) |
| `DB_HOST`/`DB_USER`/… | — | local-dev fallback vars |
