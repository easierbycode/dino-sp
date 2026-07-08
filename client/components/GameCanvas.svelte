<script lang="ts">
  import Phaser from 'phaser'
  import type { Snippet } from 'svelte'
  import { Game, Scene } from '5velte-ph4ser'
  import { DinoGame } from '../lib/game.svelte'
  import { player, THEMES } from '../lib/settings.svelte'
  import GameScene from './GameScene.svelte'

  let { game, children }: { game: DinoGame; children?: Snippet } = $props()

  let frame = $state<HTMLDivElement>()
  let phaser = $state<Phaser.Game>()
  let viewportWidth = $state(0)
  let viewportHeight = $state(0)

  // handy for debugging from the console
  $effect(() => {
    ;(window as any).__phaser = phaser
  })

  const theme = $derived(
    THEMES[player.settings.backgroundTheme] ?? THEMES.desert
  )

  // The stage always fills the viewport and the canvas is letterboxed inside
  // it (Scale.FIT), so the sky/ground split — 75% down the canvas — is
  // projected onto the viewport so the page gradient lines up with the game.
  const groundStop = $derived.by(() => {
    if (!viewportWidth || !viewportHeight) return 75
    const canvasHeight = Math.min(
      viewportWidth / (DinoGame.WIDTH / DinoGame.HEIGHT),
      viewportHeight
    )
    const groundY = (viewportHeight - canvasHeight) / 2 + canvasHeight * 0.75
    return (groundY / viewportHeight) * 100
  })

  const background = $derived(
    `linear-gradient(to bottom, ${theme.sky} 0%, ${theme.sky} ${groundStop}%, ${theme.ground} ${groundStop}%, ${theme.ground} 100%)`
  )

  export function toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      // may be rejected without a user gesture (e.g. from a gamepad button)
      frame?.requestFullscreen()?.catch((error) => {
        console.log('Fullscreen request rejected:', error)
      })
    }
  }
</script>

<svelte:window
  bind:innerWidth={viewportWidth}
  bind:innerHeight={viewportHeight}
/>

<div class="game-frame" bind:this={frame} style:background>
  {#if frame}
    <Game
      bind:instance={phaser}
      width={DinoGame.WIDTH}
      height={DinoGame.HEIGHT}
      parent={frame}
      transparent={true}
      banner={false}
      scale={{
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      }}
    >
      <Scene key="dino">
        <GameScene {game} />
      </Scene>
    </Game>
  {/if}

  <!-- HUD, dock, and modals live inside the frame so they stay visible in
       native fullscreen -->
  {@render children?.()}
</div>

<style>
  .game-frame {
    position: fixed;
    inset: 0;
    overflow: hidden;
    cursor: pointer;
  }

  .game-frame :global(canvas) {
    display: block;
  }
</style>
