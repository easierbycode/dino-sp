<script lang="ts">
  import { fetchLeaderboard, type LeaderboardEntry } from '../lib/api'
  import GlassModal from './GlassModal.svelte'

  let { open = $bindable(false) }: { open?: boolean } = $props()

  let entries = $state<LeaderboardEntry[] | null>(null)
  let error = $state(false)

  $effect(() => {
    if (!open) return
    entries = null
    error = false
    fetchLeaderboard(10)
      .then((result) => (entries = result))
      .catch(() => (error = true))
  })

  function rankClass(rank: number): string {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return 'bronze'
    return ''
  }
</script>

<GlassModal bind:open title="Leaderboard">
  {#snippet footer()}
    <span><b>ESC</b> Close</span>
    <span class="foot-note">top 10 · global</span>
  {/snippet}

  {#if error}
    <div class="notice">Unable to load leaderboard. Check your connection.</div>
  {:else if entries === null}
    <div class="notice">Loading leaderboard...</div>
  {:else if entries.length === 0}
    <div class="notice">No scores yet. Be the first!</div>
  {:else}
    {#each entries as entry (entry.rank)}
      <div class="entry">
        <span class="rank {rankClass(entry.rank)}">#{entry.rank}</span>
        <span class="name">{entry.playerName}</span>
        <span class="score">{entry.score.toLocaleString()}</span>
      </div>
    {/each}
  {/if}
</GlassModal>

<style>
  .notice {
    padding: 16px 8px;
    text-align: center;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    color: rgba(200, 230, 255, 0.6);
  }

  .entry {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 36px;
    padding: 4px 12px;
    border-radius: 8px;
    border: 1px solid rgba(102, 194, 255, 0.22);
    background: linear-gradient(
      180deg,
      rgba(80, 140, 220, 0.08),
      rgba(15, 25, 45, 0.4)
    );
  }

  .rank {
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    color: rgba(159, 215, 255, 0.7);
    width: 32px;
  }

  .rank.gold {
    color: #ffd700;
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  }

  .rank.silver {
    color: #c0c0c0;
  }

  .rank.bronze {
    color: #cd7f32;
  }

  .name {
    flex: 1;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.06em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .score {
    font-family: 'Share Tech Mono', monospace;
    font-size: 13px;
    color: #eaf6ff;
  }
</style>
