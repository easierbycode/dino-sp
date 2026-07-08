// CMG (console shell) bridge — the spriteX side of the cmg-osd protocol from
// the fullscreen redesign. When a gamepad connects, the game advertises its
// menu items to the host Guide over postMessage; the host sends back theme,
// action, and value-change messages. Standalone (no CMG parent) this module
// only tracks the accent theme, which stays dino-blue.

import { player, DINO_COLORS, difficultyMultiplier } from './settings.svelte'

export type CmgTheme = 'standalone' | 'xbox' | 'nintendo'

export interface CmgPalette {
  /** icon / label ink */
  ink: string
  /** chip + icon panel background */
  bg: string
  border: string
  glow: string
  inkGlow: string
  /** bright score / value text */
  bright: string
}

const PALETTES: Record<CmgTheme, CmgPalette> = {
  standalone: {
    ink: '#66c2ff',
    bg: 'rgba(8, 12, 22, 0.62)',
    border: 'rgba(102, 194, 255, 0.5)',
    glow: 'rgba(102, 194, 255, 0.2)',
    inkGlow: 'rgba(102, 194, 255, 0.55)',
    bright: '#eaf6ff',
  },
  xbox: {
    ink: '#9CFF6B',
    bg: 'rgba(6, 16, 9, 0.62)',
    border: 'rgba(140, 255, 110, 0.5)',
    glow: 'rgba(124, 255, 79, 0.22)',
    inkGlow: 'rgba(124, 255, 79, 0.55)',
    bright: '#eaffd2',
  },
  nintendo: {
    ink: '#ff6b76',
    bg: 'rgba(20, 8, 10, 0.62)',
    border: 'rgba(255, 69, 84, 0.5)',
    glow: 'rgba(255, 59, 73, 0.25)',
    inkGlow: 'rgba(255, 59, 73, 0.55)',
    bright: '#ffe9eb',
  },
}

class CmgState {
  theme = $state<CmgTheme>('standalone')

  /** A Guide row was activated in the host ('leaderboard' | 'controls'). */
  onaction: ((id: string) => void) | null = null

  get palette(): CmgPalette {
    return PALETTES[this.theme]
  }

  /**
   * Starts listening for host messages and advertises OSD items whenever a
   * gamepad connects (and once on boot, for pads connected before load).
   * Returns a cleanup function.
   */
  init(): () => void {
    // fallback: CMG passes ?theme= on the launch URL
    const param = new URLSearchParams(location.search).get('theme')
    if (param === 'xbox' || param === 'nintendo') {
      this.theme = param
    }

    const onMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') return

      if (data.type === 'cmg-theme') {
        if (data.theme === 'xbox' || data.theme === 'nintendo') {
          this.theme = data.theme
        } else {
          this.theme = 'standalone'
        }
      } else if (data.type === 'cmg-action') {
        this.onaction?.(String(data.id))
      } else if (data.type === 'cmg-osd-set') {
        this.#applySet(String(data.key), data.value)
      }
    }

    const advertise = () => this.advertise()

    window.addEventListener('message', onMessage)
    window.addEventListener('gamepadconnected', advertise)

    // re-broadcast on boot for already-connected pads
    for (const pad of navigator.getGamepads?.() ?? []) {
      if (pad) {
        this.advertise()
        break
      }
    }

    return () => {
      window.removeEventListener('message', onMessage)
      window.removeEventListener('gamepadconnected', advertise)
    }
  }

  /** spriteX → CMG: advertise this game's Guide section. */
  advertise(): void {
    if (window.parent === window) return

    window.parent.postMessage(
      {
        type: 'cmg-osd-items',
        section: 'DINO RUNNER',
        actions: [
          { id: 'leaderboard', label: 'Leaderboard' },
          { id: 'controls', label: 'Controls' },
        ],
        items: [
          {
            key: 'dinoColor',
            kind: 'color',
            options: DINO_COLORS,
            value: player.settings.dinoColor,
          },
          {
            key: 'difficulty',
            kind: 'slider',
            min: 0.8,
            max: 1.3,
            step: 0.1,
            unit: '×',
            value: difficultyMultiplier(player.settings.difficultyPreference),
          },
          {
            key: 'background',
            kind: 'button',
            value: player.settings.backgroundTheme.toUpperCase(),
          },
          { key: 'sound', kind: 'toggle', value: player.settings.soundEnabled },
        ],
      },
      '*'
    )
  }

  /** CMG → spriteX: a value changed in the Guide. */
  #applySet(key: string, value: unknown): void {
    if (key === 'dinoColor' && typeof value === 'string') {
      player.settings = { ...player.settings, dinoColor: value }
    } else if (key === 'difficulty' && typeof value === 'number') {
      player.settings = {
        ...player.settings,
        difficultyPreference: String(value),
      }
    } else if (key === 'background' && typeof value === 'string') {
      player.settings = {
        ...player.settings,
        backgroundTheme: value.toLowerCase(),
      }
    } else if (key === 'sound') {
      player.settings = { ...player.settings, soundEnabled: Boolean(value) }
    } else {
      return
    }
    player.save()
  }
}

export const cmg = new CmgState()
