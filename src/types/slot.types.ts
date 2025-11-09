export type SlotConstraints = {
  allowedTypes?: Array<'FRAME' | 'TEXT' | 'RECTANGLE' | 'ELLIPSE'>
  maxChildren?: number
  requiresContent?: boolean
}

export type SlotMetadata = {
  created: string
  modified: string
  author: string
}

export type SlotDefinition = {
  id: string
  componentId: string
  frameId: string
  name: string
  constraints?: SlotConstraints
  metadata: SlotMetadata
}

export type SlotContent = {
  instanceId: string
  slotId: string
  contentNodeIds: Array<string>
  originalParentId: string
  preserveOnUpdate: boolean
  version: number
}

