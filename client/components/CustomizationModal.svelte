<script lang="ts">
  import {
    DINO_COLORS,
    difficultyMultiplier,
    player,
    THEMES,
  } from '../lib/settings.svelte'
  import GlassModal from './GlassModal.svelte'

  let { open = $bindable(false) }: { open?: boolean } = $props()

  const THEME_ORDER = Object.keys(THEMES)

  const difficulty = $derived(
    difficultyMultiplier(player.settings.difficultyPreference)
  )
  const theme = $derived(
    THEMES[player.settings.backgroundTheme] ?? THEMES.desert
  )

  // every control applies immediately — "CLICK Set · saved to profile"
  function apply(patch: Partial<typeof player.settings>) {
    player.settings = { ...player.settings, ...patch }
    player.save()
  }

  function cycleBackground() {
    const index = THEME_ORDER.indexOf(player.settings.backgroundTheme)
    const next = THEME_ORDER[(index + 1) % THEME_ORDER.length]
    apply({ backgroundTheme: next })
  }
</script>

<GlassModal bind:open title="Customize">
  <div class="section"><span>Dino</span><span class="caret">▾</span></div>

  <div class="row">
    <span class="row-label">Dino Color</span>
    <span class="swatches">
      {#each DINO_COLORS as color (color)}
        <button
          class="swatch"
          class:selected={player.settings.dinoColor.toLowerCase() ===
            color.toLowerCase()}
          style:background={color}
          title={color}
          aria-label="Dino color {color}"
          onclick={() => apply({ dinoColor: color })}
        ></button>
      {/each}
    </span>
  </div>

  <div class="section"><span>World</span><span class="caret">▾</span></div>

  <button
    class="row row-button theme-row"
    style:--sky={theme.sky}
    style:--ground={theme.ground}
    onclick={cycleBackground}
  >
    <span class="row-label">Background</span>
    <span class="row-value">
      <span class="mono">{player.settings.backgroundTheme.toUpperCase()}</span>
      <span class="chev">▸</span>
    </span>
  </button>

  <div class="row">
    <span class="row-label">Difficulty</span>
    <span class="row-value slider-value">
      <span class="mono readout">{difficulty.toFixed(1)}×</span>
      <input
        type="range"
        min="0.8"
        max="1.3"
        step="0.1"
        value={difficulty}
        aria-label="Difficulty"
        onchange={(e) =>
          apply({ difficultyPreference: e.currentTarget.value })}
      />
    </span>
  </div>

  <div class="row">
    <span class="row-label">Sound</span>
    <button
      class="toggle"
      class:on={player.settings.soundEnabled}
      role="switch"
      aria-checked={player.settings.soundEnabled}
      aria-label="Sound"
      onclick={() => apply({ soundEnabled: !player.settings.soundEnabled })}
    >
      <span class="knob"></span>
    </button>
  </div>
</GlassModal>

<style>
  .section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(159, 215, 255, 0.55);
    padding: 2px 4px 4px;
  }

  .section:not(:first-child) {
    padding-top: 8px;
  }

  .caret {
    font-size: 9px;
    opacity: 0.8;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 40px;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(102, 194, 255, 0.22);
    background: linear-gradient(
      180deg,
      rgba(80, 140, 220, 0.08),
      rgba(15, 25, 45, 0.4)
    );
    color: inherit;
    font-family: inherit;
    text-align: left;
  }

  .row-button {
    cursor: pointer;
    width: 100%;
  }

  .theme-row {
    border-color: rgba(255, 255, 255, 0.35);
    background: linear-gradient(180deg, var(--sky) 0%, var(--ground) 100%);
    color: #06131f;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.25);
    box-shadow: 0 0 22px rgba(102, 194, 255, 0.35);
  }

  .theme-row .mono,
  .theme-row .chev {
    color: rgba(6, 19, 31, 0.7);
  }

  .row-label {
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  .row-value {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mono {
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    color: rgba(200, 230, 255, 0.7);
  }

  .swatches {
    display: flex;
    gap: 6px;
  }

  .swatch {
    width: 24px;
    height: 24px;
    padding: 0;
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.35);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
    cursor: pointer;
  }

  .swatch.selected {
    box-shadow:
      0 0 0 2px #fff,
      0 0 10px rgba(255, 255, 255, 0.6);
  }

  .slider-value {
    flex: 1;
    justify-content: flex-end;
  }

  .readout {
    min-width: 3em;
    text-align: right;
  }

  input[type='range'] {
    width: 150px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    border-radius: 999px;
    background: rgba(102, 194, 255, 0.25);
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #eaf6ff;
    border: 1px solid rgba(80, 150, 220, 0.8);
    box-shadow: 0 0 8px rgba(102, 194, 255, 0.6);
  }

  input[type='range']::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #eaf6ff;
    border: 1px solid rgba(80, 150, 220, 0.8);
    box-shadow: 0 0 8px rgba(102, 194, 255, 0.6);
  }

  .toggle {
    position: relative;
    width: 34px;
    height: 19px;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: rgba(102, 194, 255, 0.25);
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s ease;
  }

  .toggle.on {
    background: #4fa8e8;
  }

  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #eaf6ff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    transition: transform 0.15s ease;
  }

  .toggle.on .knob {
    transform: translateX(15px);
  }
</style>
