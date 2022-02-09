import EditorContext from './EditorContext'
import { useContext } from 'react'

export default function useSchema() {
  return useContext(EditorContext).schema
}
