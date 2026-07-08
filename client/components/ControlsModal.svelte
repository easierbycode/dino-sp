<script lang="ts">
  import { gamepad } from '../lib/gamepad.svelte'
  import GlassModal from './GlassModal.svelte'

  let { open = $bindable(false) }: { open?: boolean } = $props()
</script>

<GlassModal bind:open title="Controls">
  {#snippet footer()}
    <span><b>ESC</b> Close</span>
    {#if gamepad.connected}
      <span class="foot-note">🎮 {gamepad.id}</span>
    {/if}
  {/snippet}

  <div class="row">
    <span class="keys"><kbd>SPACE</kbd> <kbd>↑</kbd></span>
    <span class="what">Jump / Start / Restart</span>
  </div>
  <div class="row">
    <span class="keys"><kbd>CLICK</kbd></span>
    <span class="what">Jump / Start / Restart</span>
  </div>
  <div class="row">
    <span class="keys"><kbd>F</kbd></span>
    <span class="what">Fullscreen</span>
  </div>
  {#if gamepad.connected}
    <div class="row">
      <span class="keys"><kbd>{gamepad.glyphFor('jump')}</kbd></span>
      <span class="what">Jump</span>
    </div>
  {/if}
</GlassModal>

<style>
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
  }

  .keys {
    display: flex;
    gap: 6px;
  }

  kbd {
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid rgba(102, 194, 255, 0.35);
    background: rgba(15, 25, 45, 0.6);
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    color: #9fd7ff;
  }

  .what {
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.06em;
  }
</style>
