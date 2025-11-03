# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Figma Workspace** is a Figma plugin that solves two critical design workflow problems:
1. **Visual Navigation** - Navigate massive Figma files instantly with a visual command center
2. **Flexible Components** - Create components with dynamic content slots while maintaining component connection

The plugin uses a dual-tab architecture where both features work independently but integrate seamlessly.

## Architecture

### Plugin Structure
```
figma-workspace/
├── manifest.json          # Figma plugin manifest
├── code.ts               # Main plugin logic (sandbox code)
├── ui.html               # Plugin UI interface
├── src/
│   ├── core/
│   │   ├── slot-manager.ts      # Slot definition & tracking
│   │   ├── sync-engine.ts       # Component sync logic
│   │   ├── navigation-manager.ts # File scanning & navigation
│   │   └── state-manager.ts     # Plugin state
│   ├── ui/
│   │   ├── components/          # React/UI components
│   │   └── styles/             # CSS/styling
│   └── utils/
└── tests/
```

### Key Technical Components

#### 1. Navigation System
- **File Scanner**: Auto-detects screens, components, typography, colors, effects
- **Thumbnail Generator**: Creates live previews (< 100ms per thumbnail)
- **Organization Engine**: Categories, favorites, recent items, search
- Must support files with 500+ elements smoothly

#### 2. Slot System
- **Slot Definition**: Mark frames within components as content slots
- **Content Injection**: Add arbitrary content while preserving component link
- **Sync Engine**: Update components while preserving slot content (99.9% success rate)
- **Template Library**: Save and reuse slot configurations

#### 3. Data Storage
**Plugin Data** (stored on nodes):
```typescript
interface SlotDefinition {
  id: string;
  componentId: string;
  frameId: string;
  name: string;
  constraints?: SlotConstraints;
  metadata: { created: Date; modified: Date; author: string; }
}
```

**Client Storage** (user preferences):
- Theme settings, favorites, recent items, saved templates

## Figma Plugin Specifics

### Critical API Usage
- `figma.currentPage` - Access current page
- `node.setPluginData()` / `node.getPluginData()` - Store slot metadata on nodes
- `figma.on('selectionchange')` - Track user selections
- `node.findAll()` - Find component instances
- `figma.clientStorage` - Persist user preferences

### Performance Requirements
- Plugin load: < 1 second
- Slot detection: < 500ms per component
- Content injection: < 1 second
- Sync operation: < 2 seconds for 100 instances
- Thumbnail generation: < 100ms each
- Memory usage: < 50MB for typical files

### Plugin Window
- **Type**: Floating/dockable panel
- **Default**: 400w × 600h (resizable, min 320×400, max 600×100%h)
- **Collapsed**: 60×60 floating button
- **Theme**: Auto-detect from Figma (light/dark)

## Development Phases

### Phase 1: Foundation & Navigation (Weeks 1-6)
1. Core infrastructure: floating panel, tab system, state management
2. Navigation features: file scanning, thumbnails, jump-to navigation
3. Smart organization: search, filters, categories, favorites
4. Performance optimization for large files

### Phase 2: Slot Replacement (Weeks 7-10)
1. Slot definition system with visual indicators
2. Content injection engine with drag-and-drop
3. Smart synchronization that preserves slot content
4. Template library for reusable configurations

### Phase 3: Integration (Weeks 11-12)
1. Cross-tab features (navigate to slotted components)
2. Unified search across both systems
3. Workspace presets
4. Beta testing and polish

## Key Technical Considerations

### Slot Synchronization
The most complex technical challenge is updating component instances when the master changes while preserving custom slot content:
- Track component version/changes
- Identify what changed (structure vs. style)
- Preserve slot content during updates
- Handle conflicts gracefully (with rollback)
- Batch operations efficiently

### Performance Strategy
- Lazy load slot data (don't scan entire file upfront)
- Batch operations for multiple instances
- Incremental sync (not full rebuild)
- Debounced selection tracking
- Efficient thumbnail generation with caching

### Data Integrity
- Slot metadata stored using `setPluginData()` on nodes
- Version all data structures for migration
- Validate slot references on component updates
- Implement rollback for failed sync operations

## UI Design Principles

- **Floating button** (collapsed): 60×60 draggable circle
- **Expanded panel**: Tab switcher at top (Navigation | Slot Replacement)
- **Theme**: Match Figma's light/dark mode automatically
- **Responsive**: Adjust grid columns based on panel width (1-3 columns)
- **Keyboard shortcuts**: Support for power users

## Testing Strategy

### Test Files
- Small: 10 components, 50 instances
- Medium: 50 components, 500 instances
- Large: 200 components, 2000 instances
- Enterprise: 500+ components, 5000+ instances

### Critical Test Scenarios
1. Component updates with slot content preservation
2. Deep nesting (components with slots containing slotted components)
3. Large content in slots (1000+ nodes)
4. Rapid consecutive updates
5. Navigation performance with 500+ screens
