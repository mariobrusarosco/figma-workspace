import { getStorageItem, setStorageItem } from '../utils/storage'

export type PluginPreferences = {
  theme: 'auto' | 'light' | 'dark'
  showTutorials: boolean
  defaultTab: 'navigation' | 'slots'
  thumbnailSize: 'small' | 'medium' | 'large'
}

export type PluginState = {
  preferences: PluginPreferences
  favorites: Array<string>
  recentItems: Array<string>
  customCategories: Record<string, Array<string>>
}

const STORAGE_KEY = 'pluginState'

export class StateManager {
  private state: PluginState

  constructor() {
    this.state = this.getDefaultState()
  }

  public load = async () => {
    const savedState = await getStorageItem<PluginState>(STORAGE_KEY)
    if (savedState) {
      this.state = savedState
    }
  }

  public save = async () => {
    await setStorageItem(STORAGE_KEY, this.state)
  }

  public getState = (): PluginState => {
    return this.state
  }

  public setState = (partialState: Partial<PluginState>) => {
    this.state = { ...this.state, ...partialState }
  }

  public getPreferences = () => {
    return this.state.preferences
  }

  public setPreferences = (preferences: Partial<PluginPreferences>) => {
    this.state.preferences = { ...this.state.preferences, ...preferences }
  }

  public addFavorite = (nodeId: string) => {
    if (!this.state.favorites.includes(nodeId)) {
      this.state.favorites.push(nodeId)
    }
  }

  public removeFavorite = (nodeId: string) => {
    this.state.favorites = this.state.favorites.filter(candidate => candidate !== nodeId)
  }

  public addRecentItem = (nodeId: string) => {
    this.state.recentItems = [nodeId, ...this.state.recentItems.filter(candidate => candidate !== nodeId)].slice(
      0,
      20
    )
  }

  private getDefaultState = (): PluginState => {
    return {
      preferences: {
        theme: 'auto',
        showTutorials: true,
        defaultTab: 'navigation',
        thumbnailSize: 'medium'
      },
      favorites: [],
      recentItems: [],
      customCategories: {}
    }
  }
}
