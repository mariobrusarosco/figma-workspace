import { emit, on } from '@create-figma-plugin/utilities'

import type { PluginState } from '../core/state-manager'

export type PluginToUiMessage =
  | { type: 'SHOW_UI' }
  | { type: 'STATE_UPDATE'; state: PluginState }

export type UiToPluginMessage =
  | { type: 'NAVIGATE'; nodeId: string }
  | { type: 'SAVE_STATE'; state: PluginState }

export const sendToPlugin = (message: UiToPluginMessage) => {
  emit('MESSAGE', message)
}

export const onPluginMessage = (callback: (message: PluginToUiMessage) => void) => {
  on('MESSAGE', callback)
}
