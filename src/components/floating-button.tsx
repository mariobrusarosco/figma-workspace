import { h } from 'preact'

type FloatingButtonProps = {
  onClick: () => void
}

export const FloatingButton = ({ onClick }: FloatingButtonProps) => {
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
      type="button"
    >
      Open
    </button>
  )
}