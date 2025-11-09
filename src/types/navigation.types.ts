export type NavigationItemType = 'screen' | 'component' | 'typography' | 'color' | 'effect'

export type NavigationItem = {
  id: string
  name: string
  type: NavigationItemType
  thumbnail?: Uint8Array
  lastModified?: string
  usageCount?: number
}

export type NavigationCategory = {
  name: string
  items: Array<NavigationItem>
  collapsed: boolean
}
