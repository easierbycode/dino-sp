<script lang="ts">
  import { onMount } from 'svelte'
  import { checkHealth, submitScore } from '../lib/api'
  import { cmg } from '../lib/cmg.svelte'
  import { DinoGame, type GameOverStats } from '../lib/game.svelte'
  import { gamepad } from '../lib/gamepad.svelte'
  import { difficultyMultiplier, player } from '../lib/settings.svelte'
  import ControlsModal from '../components/ControlsModal.svelte'
  import CustomizationModal from '../components/CustomizationModal.svelte'
  import GameCanvas from '../components/GameCanvas.svelte'
  import LeaderboardModal from '../components/LeaderboardModal.svelte'
  import PlayerModal from '../components/PlayerModal.svelte'

  const game = new DinoGame()

  // handy for debugging from the console, as the original game.js did
  ;(window as any).dinoGame = game
  ;(window as any).resetPlayerData = () => {
    localStorage.removeItem('playerName')
    localStorage.removeItem('gameSettings')
    localStorage.removeItem('dinoHighScore')
    location.reload()
  }

  let gameCanvas = $state<ReturnType<typeof GameCanvas>>()
  let showPlayerModal = $state(false)
  let showCustomization = $state(false)
  let showControls = $state(false)
  let showLeaderboard = $state(false)
  let showNewRecord = $state(false)

  const anyModalOpen = $derived(
    showPlayerModal || showCustomization || showControls || showLeaderboard
  )

  // ── dock visibility ──────────────────────────────────────────────────────
  // The dock fades out 2s into a run and returns on pause / game-over /
  // pointer-move. While a gamepad is connected the CMG Guide owns the UI, so
  // all icons are hidden entirely.
  let dockAwake = $state(true)
  let dockTimer: ReturnType<typeof setTimeout> | undefined

  const dockVisible = $derived(
    !gamepad.connected && (game.status !== 'playing' || dockAwake)
  )

  function wakeDock() {
    dockAwake = true
    clearTimeout(dockTimer)
    if (game.status === 'playing') {
      dockTimer = setTimeout(() => (dockAwake = false), 2000)
    }
  }

  $effect(() => {
    if (game.status === 'playing') {
      wakeDock() // starts the 2s fade
    } else {
      clearTimeout(dockTimer)
      dockAwake = true
    }
  })

  // difficulty follows the customization settings (port of applyCustomizations)
  $effect(() => {
    game.setDifficulty(
      difficultyMultiplier(player.settings.difficultyPreference)
    )
  })

  const paddedScore = $derived(
    String(Math.floor(game.score)).padStart(6, '0')
  )

  game.ongameover = async (stats: GameOverStats) => {
    if (!player.name) return

    const result = await submitScore({ playerName: player.name, ...stats })
    if (result) {
      if (result.isNewRecord) {
        console.log('🏆 NEW GLOBAL RECORD!')
        showNewRecord = true
        setTimeout(() => (showNewRecord = false), 3000)
      }
      console.log(`📊 Score submitted! Global rank: #${result.globalRank}`)
    }
  }

  onMount(() => {
    checkHealth()
    player.load()

    // gamepad: bottom face button jumps by default; see public/codemonkey.json
    const cleanupGamepad = gamepad.init()
    gamepad.onaction = (action) => {
      if (action === 'jump') {
        game.handleJump()
      } else if (action === 'fullscreen') {
        gameCanvas?.toggleFullscreen()
      }
    }

    // CMG bridge: advertise OSD items on gamepad connect, apply Guide changes
    const cleanupCmg = cmg.init()
    cmg.onaction = (id) => {
      if (id === 'leaderboard') showLeaderboard = true
      else if (id === 'controls') showControls = true
    }

    // prompt for a player name shortly after load, as the original did
    let timer: ReturnType<typeof setTimeout> | undefined
    if (!player.name) {
      timer = setTimeout(() => (showPlayerModal = true), 1000)
    }

    return () => {
      cleanupGamepad()
      cleanupCmg()
      gamepad.onaction = null
      cmg.onaction = null
      clearTimeout(timer)
      clearTimeout(dockTimer)
    }
  })

  function onKeydown(event: KeyboardEvent) {
    // let players type in the modals
    const target = event.target as HTMLElement
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      return
    }
    if (anyModalOpen) return

    if (event.code === 'KeyF') {
      gameCanvas?.toggleFullscreen()
      return
    }

    if (event.code !== 'Space' && event.code !== 'ArrowUp') return

    event.preventDefault()
    game.handleJump()
  }

  const dock = [
    {
      title: 'Leaderboard',
      icon: '#',
      label: 'RANKS',
      open: () => (showLeaderboard = true),
    },
    {
      title: 'Customize',
      icon: '✎︎',
      label: 'STYLE',
      open: () => (showCustomization = true),
    },
    {
      title: 'Controls',
      icon: '✛',
      label: 'INPUT',
      open: () => (showControls = true),
    },
    {
      title: 'Player',
      icon: '@',
      label: 'PLAYER',
      open: () => (showPlayerModal = true),
    },
    {
      title: 'Fullscreen (F)',
      icon: '⛶',
      label: 'FULL',
      open: () => gameCanvas?.toggleFullscreen(),
    },
  ]
</script>

<svelte:window onkeydown={onKeydown} onpointermove={wakeDock} />

<GameCanvas bind:this={gameCanvas} {game}>
  <div
    class="hud"
    style:--ink={cmg.palette.ink}
    style:--chip-bg={cmg.palette.bg}
    style:--chip-border={cmg.palette.border}
    style:--chip-glow={cmg.palette.glow}
    style:--ink-glow={cmg.palette.inkGlow}
    style:--bright={cmg.palette.bright}
  >
    <!-- score chip — the only permanent HUD -->
    <div class="score-chip">
      <span class="score-label">SCORE</span>
      <span class="score-value">{paddedScore}</span>
    </div>

    <!-- minimized UI dock (hidden while a gamepad / CMG Guide is active) -->
    {#if !gamepad.connected}
      <div class="dock" class:faded={!dockVisible}>
        {#each dock as item (item.title)}
          <button class="dock-icon" title={item.title} onclick={item.open}>
            <span class="glyph">{item.icon}</span>
            <span class="label">{item.label}</span>
          </button>
        {/each}
      </div>
    {/if}

    {#if showNewRecord}
      <div class="new-record">🏆 NEW GLOBAL RECORD! 🏆</div>
    {/if}

    <PlayerModal bind:open={showPlayerModal} />
    <CustomizationModal bind:open={showCustomization} />
    <ControlsModal bind:open={showControls} />
    <LeaderboardModal bind:open={showLeaderboard} />
  </div>
</GameCanvas>

<style>
  .hud {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 20;
  }

  .hud :global(.scrim),
  .score-chip,
  .dock,
  .new-record {
    pointer-events: auto;
  }

  .score-chip {
    position: absolute;
    top: 24px;
    left: 24px;
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 10px 16px;
    background: var(--chip-bg);
    border: 1px solid var(--chip-border);
    border-radius: 10px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    box-shadow: 0 0 24px var(--chip-glow);
  }

  .score-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.24em;
    color: var(--ink);
  }

  .score-value {
    font-family: Orbitron, sans-serif;
    font-weight: 700;
    font-size: 20px;
    letter-spacing: 0.08em;
    color: var(--bright);
  }

  .dock {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 26px;
    display: flex;
    justify-content: center;
    gap: 10px;
    transition: opacity 0.4s ease;
  }

  .dock.faded {
    opacity: 0;
    pointer-events: none;
  }

  .dock-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 64px;
    padding: 10px 10px 8px;
    background: var(--chip-bg);
    border: 1px solid var(--chip-border);
    border-radius: 12px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    box-shadow: 0 0 20px var(--chip-glow);
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .dock-icon:hover {
    transform: translateY(-2px);
  }

  .glyph {
    font-family: 'Share Tech Mono', monospace;
    font-size: 22px;
    line-height: 1;
    color: var(--ink);
    text-shadow: 0 0 12px var(--ink-glow);
  }

  .label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.22em;
    color: rgba(255, 255, 255, 0.55);
  }

  .new-record {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 10px;
    border: 1px solid rgba(255, 215, 0, 0.6);
    background: rgba(30, 24, 4, 0.72);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    box-shadow: 0 0 24px rgba(255, 215, 0, 0.35);
    color: #ffd700;
    font-family: Orbitron, sans-serif;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.1em;
    animation: fadeIn 0.3s ease;
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
