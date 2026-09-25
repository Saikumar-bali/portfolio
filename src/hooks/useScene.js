import { useContext } from 'react'
import { SceneContext } from '../context/SceneContext'

export function useScene() {
  const context = useContext(SceneContext)
  if (!context) throw new Error('useScene must be used inside SceneProvider')
  return context
}
