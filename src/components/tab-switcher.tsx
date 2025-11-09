import { Tabs, type TabsOption } from '@create-figma-plugin/ui'
import { h } from 'preact'

type TabSwitcherProps = {
  activeTab: 'navigation' | 'slots'
  onTabChange: (tab: 'navigation' | 'slots') => void
  onCollapse: () => void
}

export const TabSwitcher = ({ activeTab, onCollapse, onTabChange }: TabSwitcherProps) => {
  const options: Array<TabsOption> = [
    { value: 'navigation', children: 'Navigation' },
    { value: 'slots', children: 'Slot Replacement' }
  ]

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px'
      }}
    >
      <Tabs
        onValueChange={(value: string) => onTabChange(value as 'navigation' | 'slots')}
        options={options}
        value={activeTab}
      />
      <button
        onClick={onCollapse}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '4px 8px'
        }}
        type="button"
      >
        -
      </button>
    </div>
  )
}

