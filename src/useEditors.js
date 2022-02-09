import EditorContext from './EditorContext'
import { useContext } from 'react'

export default function useEditors() {
  const { editors } = useContext(EditorContext)

  return editors
}
