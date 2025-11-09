# Implementation Plan: Figma Workspace Plugin

## Overview

This document outlines the complete implementation plan for building the Figma Workspace plugin using the official `create-figma-plugin` toolkit. The plugin features a dual-tab architecture for navigation and slot-based component management.

---

## Phase 1: Initialize Project with Official Template

### Step 1: Initialize with create-figma-plugin

**Action:**
```bash
npx --yes create-figma-plugin
```

**Interactive Prompts:**
- Choose a template with UI support (recommended: "plugin/preact-rectangles" or "plugin/react-editor")
- This scaffolds a complete project structure with TypeScript + React/Preact

**What You Get:**
- Pre-configured TypeScript setup
- esbuild-based build system
- Development server with hot reload
- Figma plugin manifest auto-generation
- Official UI component library (`@create-figma-plugin/ui`)

---

### Step 2: Configure package.json

**Action:** Update the `"figma-plugin"` section in `package.json`

**Configuration:**
```json
{
  "figma-plugin": {
    "name": "Figma Workspace",
    "id": "PLUGIN_ID",
    "main": "src/main.ts",
    "ui": "src/ui.tsx",
    "editorType": ["figma"],
    "documentAccess": "dynamic-page",
    "permissions": ["currentuser"],
    "menu": [
      {
        "name": "Open Workspace",
        "main": "src/main.ts",
        "ui": "src/ui.tsx"
      }
    ],
    "relaunchButtons": {
      "src/main.ts--default": {
        "name": "Reopen Workspace",
        "main": "src/main.ts",
        "ui": "src/ui.tsx"
      }
    }
  }
}
```

**Key Settings:**
- `documentAccess: "dynamic-page"` - Access current page for navigation
- `permissions: ["currentuser"]` - Access user info for metadata
- Single menu command to launch the plugin
- Relaunch button for quick access (uses command ID `src/main.ts--default`, derived from the `main` entry)

---

### Step 3: Set Up Project Structure

**Action:** Create the following directory structure

```
figma-workspace/
├── src/
│   ├── main.ts                      # Plugin main logic (Figma API context)
│   ├── ui.tsx                       # Main UI component with tab switching
│   │
│   ├── components/                  # UI Components
│   │   ├── NavigationTab.tsx        # Tab 1: Navigation features
│   │   ├── SlotReplacementTab.tsx   # Tab 2: Slot system features
│   │   ├── FloatingButton.tsx       # Collapsed state (60x60 button)
│   │   ├── TabSwitcher.tsx          # Tab navigation component
│   │   └── ThemeProvider.tsx        # Theme detection wrapper
│   │
│   ├── core/                        # Core Business Logic
│   │   ├── navigation-manager.ts    # File scanning & navigation logic
│   │   ├── slot-manager.ts          # Slot definition & tracking
│   │   ├── sync-engine.ts           # Component sync logic
│   │   └── state-manager.ts         # Plugin state management
│   │
│   ├── utils/                       # Utilities
│   │   ├── messaging.ts             # Plugin ↔ UI communication helpers
│   │   ├── thumbnail-generator.ts   # Thumbnail creation utilities
│   │   └── storage.ts               # clientStorage wrapper
│   │
│   └── types/                       # TypeScript Types
│       ├── navigation.types.ts      # Navigation-related types
│       ├── slot.types.ts            # Slot system types
│       └── index.ts                 # Export all types
│
├── build-figma-plugin.main.js       # (Optional) Customize main bundle
├── build-figma-plugin.ui.js         # (Optional) Customize UI bundle
├── package.json
├── tsconfig.json
├── CLAUDE.md                        # Already created
├── IMPLEMENTATION-PLAN.md           # This file
├── figma-workspace-prd.md           # PRD document
└── figma-workspace-executive-summary.md
```

**Files to Create Initially:**
1. `src/main.ts` - Plugin entry point
2. `src/ui.tsx` - Main UI with tab structure
3. `src/components/TabSwitcher.tsx` - Tab navigation0
4. `src/core/state-manager.ts` - State management
5. `src/utils/messaging.ts` - Communication layer

---

## Phase 2: Build Foundation Infrastructure

### Step 4: Create Basic Floating Panel

**File: `src/ui.tsx`**

**Requirements:**
- Resizable UI window
  - Default: 400w × 600h
  - Min: 320w × 400h
  - Max: 600w × 100%h
- Tab switcher at top (Navigation | Slot Replacement)
- Auto-detect theme (light/dark) using Figma's theme
- Collapsed state toggle (minimize to 60×60 floating button)

**Implementation:**
```typescript
import { render, Container, Tabs } from '@create-figma-plugin/ui';
import { h } from 'preact';
import { useState } from 'preact/hooks';

function Plugin() {
  const [activeTab, setActiveTab] = useState<'navigation' | 'slots'>('navigation');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Container>
      {isCollapsed ? (
        <FloatingButton onClick={() => setIsCollapsed(false)} />
      ) : (
        <>
          <TabSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onCollapse={() => setIsCollapsed(true)}
          />
          {activeTab === 'navigation' ? <NavigationTab /> : <SlotReplacementTab />}
        </>
      )}
    </Container>
  );
}

export default render(Plugin);
```

**Window Configuration (in `src/main.ts`):**
```typescript
figma.showUI(__html__, {
  width: 400,
  height: 600,
  themeColors: true, // Auto-detect theme
  title: 'Figma Workspace'
});
```

---

### Step 5: Set Up State Management

**File: `src/core/state-manager.ts`**

**Purpose:**
- Centralized state for plugin preferences
- Persist user settings across sessions
- Manage favorites, recent items, custom categories

**Implementation:**
```typescript
import { emit } from '@create-figma-plugin/utilities';

interface PluginState {
  preferences: {
    theme: 'auto' | 'light' | 'dark';
    showTutorials: boolean;
    defaultTab: 'navigation' | 'slots';
    thumbnailSize: 'small' | 'medium' | 'large';
  };
  favorites: string[]; // Node IDs
  recentItems: string[]; // Node IDs (max 20)
  customCategories: Record<string, string[]>;
}

export class StateManager {
  private state: PluginState;

  async load(): Promise<void> {
    const saved = await figma.clientStorage.getAsync('pluginState');
    this.state = saved || this.getDefaultState();
  }

  async save(): Promise<void> {
    await figma.clientStorage.setAsync('pluginState', this.state);
  }

  getDefaultState(): PluginState {
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
    };
  }

  // Getters and setters...
}
```

**File: `src/utils/storage.ts`**

**Purpose:** Wrapper around `figma.clientStorage` for type safety

```typescript
export async function getStorageItem<T>(key: string): Promise<T | null> {
  return await figma.clientStorage.getAsync(key);
}

export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  await figma.clientStorage.setAsync(key, value);
}
```

---

### Step 6: Implement Plugin ↔ UI Messaging

**File: `src/utils/messaging.ts`**

**Purpose:** Type-safe communication between plugin code and UI

**Implementation:**
```typescript
import { on, emit } from '@create-figma-plugin/utilities';

// Message types
export interface ShowUIMessage {
  type: 'SHOW_UI';
}

export interface StateUpdateMessage {
  type: 'STATE_UPDATE';
  state: PluginState;
}

export interface NavigateMessage {
  type: 'NAVIGATE';
  nodeId: string;
}

export type PluginMessage =
  | ShowUIMessage
  | StateUpdateMessage
  | NavigateMessage;

// Plugin side (main.ts)
export function sendToUI(message: PluginMessage) {
  figma.ui.postMessage(message);
}

// UI side (ui.tsx)
export function onMessageFromPlugin(
  callback: (message: PluginMessage) => void
) {
  on('MESSAGE', callback);
}

// UI to Plugin
export function sendToPlugin(message: PluginMessage) {
  emit('MESSAGE', message);
}
```

---

### Step 7: Create Tab Components Structure

**File: `src/components/TabSwitcher.tsx`**

```typescript
import { h } from 'preact';
import { Tabs, TabsOption } from '@create-figma-plugin/ui';

interface TabSwitcherProps {
  activeTab: 'navigation' | 'slots';
  onTabChange: (tab: 'navigation' | 'slots') => void;
  onCollapse: () => void;
}

export function TabSwitcher({ activeTab, onTabChange, onCollapse }: TabSwitcherProps) {
  const options: TabsOption[] = [
    { value: 'navigation', children: 'Navigation' },
    { value: 'slots', children: 'Slot Replacement' }
  ];

  return (
    <div className="tab-switcher">
      <Tabs
        options={options}
        value={activeTab}
        onValueChange={onTabChange}
      />
      <button onClick={onCollapse} className="collapse-button">
        −
      </button>
    </div>
  );
}
```

**File: `src/components/NavigationTab.tsx`** (Placeholder)

```typescript
import { h } from 'preact';
import { Container, Text, VerticalSpace } from '@create-figma-plugin/ui';

export function NavigationTab() {
  return (
    <Container>
      <VerticalSpace space="small" />
      <Text>Navigation Tab - Coming Soon</Text>
      <VerticalSpace space="small" />
      {/* TODO: Implement navigation features in Phase 1 */}
    </Container>
  );
}
```

**File: `src/components/SlotReplacementTab.tsx`** (Placeholder)

```typescript
import { h } from 'preact';
import { Container, Text, VerticalSpace } from '@create-figma-plugin/ui';

export function SlotReplacementTab() {
  return (
    <Container>
      <VerticalSpace space="small" />
      <Text>Slot Replacement Tab - Coming Soon</Text>
      <VerticalSpace space="small" />
      {/* TODO: Implement slot features in Phase 2 */}
    </Container>
  );
}
```

**File: `src/components/FloatingButton.tsx`**

```typescript
import { h } from 'preact';

interface FloatingButtonProps {
  onClick: () => void;
}

export function FloatingButton({ onClick }: FloatingButtonProps) {
  return (
    <button
      className="floating-button"
      onClick={onClick}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        fontSize: '24px'
      }}
    >
      🏠
    </button>
  );
}
```

---

### Step 8: Set Up Main Plugin Logic

**File: `src/main.ts`**

```typescript
import { once, showUI } from '@create-figma-plugin/utilities';
import { StateManager } from './core/state-manager';

export default function () {
  const stateManager = new StateManager();

  // Initialize state
  stateManager.load().then(() => {
    // Show UI
    showUI({
      width: 400,
      height: 600,
      title: 'Figma Workspace'
    });

    // Send initial state to UI
    figma.ui.postMessage({
      type: 'STATE_UPDATE',
      state: stateManager.getState()
    });
  });

  // Listen for messages from UI
  figma.ui.onmessage = async (message) => {
    switch (message.type) {
      case 'NAVIGATE':
        handleNavigation(message.nodeId);
        break;
      case 'SAVE_STATE':
        await stateManager.save();
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  };
}

function handleNavigation(nodeId: string) {
  const node = figma.getNodeById(nodeId);
  if (node) {
    figma.currentPage.selection = [node as SceneNode];
    figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
  }
}
```

---

### Step 9: Test Build & Development Workflow

**Actions:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run watch
   ```

3. **Load plugin in Figma:**
   - Open Figma Desktop App
   - Go to Plugins → Development → Import plugin from manifest
   - Select `manifest.json` (auto-generated in project root)

4. **Verify functionality:**
   - [ ] Plugin UI opens
   - [ ] Tabs switch correctly
   - [ ] Collapse/expand works
   - [ ] Theme detection works (try switching Figma light/dark mode)
   - [ ] Hot reload works (make a change, save, see update)

5. **Debug:**
   - Open console: Quick Actions → "Show/Hide Console"
   - Check for errors
   - Verify messages between plugin and UI

---

## TypeScript Types

**File: `src/types/navigation.types.ts`**

```typescript
export interface NavigationItem {
  id: string;
  name: string;
  type: 'screen' | 'component' | 'typography' | 'color' | 'effect';
  thumbnail?: Uint8Array;
  lastModified?: Date;
  usageCount?: number;
}

export interface NavigationCategory {
  name: string;
  items: NavigationItem[];
  collapsed: boolean;
}
```

**File: `src/types/slot.types.ts`**

```typescript
export interface SlotDefinition {
  id: string;
  componentId: string;
  frameId: string;
  name: string;
  constraints?: SlotConstraints;
  metadata: {
    created: Date;
    modified: Date;
    author: string;
  };
}

export interface SlotConstraints {
  allowedTypes?: ('FRAME' | 'TEXT' | 'RECTANGLE' | 'ELLIPSE')[];
  maxChildren?: number;
  requiresContent?: boolean;
}

export interface SlotContent {
  instanceId: string;
  slotId: string;
  contentNodes: string[];
  originalParent: string;
  preserveOnUpdate: boolean;
  version: number;
}
```

---

## Expected Outcomes

After completing this foundation phase, you will have:

✅ **Fully configured Figma plugin project** with TypeScript
✅ **Modern build system** (esbuild) with hot reload
✅ **Basic dual-tab UI structure** with tab switching
✅ **Theme detection** working automatically
✅ **State management** with persistence
✅ **Plugin ↔ UI messaging** infrastructure
✅ **Collapsible floating panel** UI
✅ **Development workflow** established

---

## Next Steps (After Foundation)

### Phase 1: Navigation Tab (Weeks 3-6)
- Implement file scanner to detect screens/components
- Generate thumbnails for visual navigation
- Build search and filter functionality
- Add favorites and recent items
- Optimize for large files (500+ elements)

### Phase 2: Slot Replacement Tab (Weeks 7-10)
- Build slot definition system
- Implement content injection engine
- Create smart sync engine
- Add template library

### Phase 3: Integration (Weeks 11-12)
- Cross-tab features
- Advanced search
- Workspace presets
- Beta testing and polish

---

## Estimated Timeline

| Task | Duration |
|------|----------|
| Step 1-3: Project initialization | 30-45 minutes |
| Step 4-7: UI foundation | 1-2 hours |
| Step 8: Plugin logic | 30 minutes |
| Step 9: Testing & debugging | 30-60 minutes |
| **Total Foundation Phase** | **3-4 hours** |

---

## Dependencies

**Core Dependencies:**
```json
{
  "dependencies": {
    "@create-figma-plugin/ui": "^4.0.3",
    "@create-figma-plugin/utilities": "^3.3.1",
    "preact": "^10.x"
  },
  "devDependencies": {
    "@create-figma-plugin/build": "^3.3.1",
    "@create-figma-plugin/tsconfig": "^3.0.0",
    "@figma/plugin-typings": "^1.x",
    "typescript": "^5.x"
  }
}
```

These will be automatically installed when you run `npx create-figma-plugin`.

---

## Resources

- **Create Figma Plugin Docs:** https://yuanqing.github.io/create-figma-plugin/
- **UI Component Library:** https://yuanqing.github.io/create-figma-plugin/ui/
- **Figma Plugin API:** https://www.figma.com/plugin-docs/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/

---

## Success Criteria

Before moving to Phase 1 (Navigation features), verify:

- [ ] Plugin loads without errors
- [ ] Both tabs render and switch smoothly
- [ ] Collapse/expand functionality works
- [ ] Theme switches with Figma (light/dark)
- [ ] State persists across sessions
- [ ] Hot reload works during development
- [ ] No TypeScript errors
- [ ] Console shows no warnings

---

**Last Updated:** 2025-11-02
**Status:** Ready for Implementation
**Next Milestone:** Complete foundation (Steps 1-9), then begin Phase 1: Navigation Tab
