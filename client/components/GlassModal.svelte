<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    open = $bindable(false),
    title,
    footer,
    children,
  }: {
    open?: boolean
    title: string
    footer?: Snippet
    children?: Snippet
  } = $props()

  function onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      open = false
    }
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (open && e.key === 'Escape') {
      e.stopPropagation()
      open = false
    }
  }}
/>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="scrim" onclick={onBackdropClick}>
    <div class="panel" role="dialog" aria-label={title}>
      <div class="head">
        <span class="title">{title}</span>
        <button class="close" onclick={() => (open = false)} aria-label="Close">
          ✕
        </button>
      </div>
      <div class="body">
        {@render children?.()}
      </div>
      <div class="foot">
        {#if footer}
          {@render footer()}
        {:else}
          <span><b>CLICK</b> Set</span>
          <span><b>ESC</b> Close</span>
          <span class="foot-note">saved to profile</span>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .scrim {
    position: absolute;
    inset: 0;
    z-index: 30;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  .panel {
    width: 380px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: #dceaff;
    font-family: Orbitron, sans-serif;
    background: linear-gradient(
      180deg,
      rgba(10, 18, 32, 0.94),
      rgba(6, 10, 20, 0.96)
    );
    border: 1px solid rgba(102, 194, 255, 0.5);
    border-radius: 12px;
    box-shadow:
      0 0 38px rgba(102, 194, 255, 0.28),
      inset 0 0 0 1px rgba(102, 194, 255, 0.08);
    -webkit-backdrop-filter: blur(8px) saturate(140%);
    backdrop-filter: blur(8px) saturate(140%);
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 12px 10px 16px;
    border-bottom: 1px solid rgba(102, 194, 255, 0.18);
  }

  .title {
    font-weight: 800;
    letter-spacing: 0.28em;
    font-size: 14px;
    color: #eaf6ff;
    text-shadow: 0 0 14px rgba(102, 194, 255, 0.5);
    text-transform: uppercase;
  }

  .close {
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: rgba(200, 230, 255, 0.6);
    font-size: 14px;
    cursor: pointer;
  }

  .close:hover {
    background: rgba(102, 194, 255, 0.12);
    color: #eaf6ff;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px 12px;
    overflow-y: auto;
  }

  .foot {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 14px;
    border-top: 1px solid rgba(102, 194, 255, 0.18);
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: rgba(200, 230, 255, 0.55);
    text-transform: uppercase;
  }

  .foot :global(b) {
    color: #eaf6ff;
  }

  .foot-note,
  .foot :global(.foot-note) {
    margin-left: auto;
    opacity: 0.7;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
