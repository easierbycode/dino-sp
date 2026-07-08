<script lang="ts">
  import { player } from '../lib/settings.svelte'
  import GlassModal from './GlassModal.svelte'

  let { open = $bindable(false) }: { open?: boolean } = $props()

  let name = $state('')
  let input = $state<HTMLInputElement>()

  $effect(() => {
    if (open) {
      name = player.name ?? ''
      input?.focus()
      input?.select()
    }
  })

  function save() {
    const trimmed = name.trim()
    if (trimmed.length > 0 && trimmed.length <= 20) {
      player.setName(trimmed)
      open = false
      console.log(`✅ Player name saved: ${trimmed}`)
    } else if (trimmed.length === 0) {
      alert('Please enter a name')
    } else {
      alert('Please enter a valid name (1-20 characters)')
    }
  }
</script>

<GlassModal bind:open title="Player">
  {#snippet footer()}
    <span><b>ENTER</b> Save</span>
    <span><b>ESC</b> Close</span>
    <span class="foot-note">scores go global</span>
  {/snippet}

  <p class="hint">
    Enter your name to save scores and compete on the global leaderboard:
  </p>
  <input
    type="text"
    class="name-input"
    placeholder="Your name"
    maxlength="20"
    bind:this={input}
    bind:value={name}
    onkeydown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        save()
      }
    }}
  />
  <div class="buttons">
    <button class="primary" onclick={save}>Save &amp; Play</button>
    <button class="ghost" onclick={() => (open = false)}>Play Anonymous</button>
  </div>
</GlassModal>

<style>
  .hint {
    margin: 2px 4px 6px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: rgba(200, 230, 255, 0.7);
  }

  .name-input {
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(102, 194, 255, 0.35);
    background: rgba(15, 25, 45, 0.5);
    color: #eaf6ff;
    font-family: 'Share Tech Mono', monospace;
    font-size: 14px;
    letter-spacing: 0.04em;
  }

  .name-input:focus {
    outline: none;
    border-color: #66c2ff;
    box-shadow: 0 0 12px rgba(102, 194, 255, 0.35);
  }

  .buttons {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .buttons button {
    flex: 1;
    min-height: 38px;
    border-radius: 8px;
    font-family: Orbitron, sans-serif;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.08em;
    cursor: pointer;
  }

  .primary {
    border: 1px solid #8fd0ff;
    background: linear-gradient(
      180deg,
      #cfe8ff 0%,
      #66c2ff 35%,
      #3fa2e8 70%,
      #1c6fb8 100%
    );
    color: #06131f;
    box-shadow: 0 0 22px rgba(102, 194, 255, 0.45);
  }

  .ghost {
    border: 1px solid rgba(102, 194, 255, 0.22);
    background: linear-gradient(
      180deg,
      rgba(80, 140, 220, 0.08),
      rgba(15, 25, 45, 0.4)
    );
    color: #dceaff;
  }
</style>
