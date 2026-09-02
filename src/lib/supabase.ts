import { createClient } from '@supabase/supabase-js'
import type { MindmapDoc } from '@/types/mindmap'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Mindmap = {
  id: string
  user_id: string
  title: string
  current_doc_json: MindmapDoc
  created_at: string
  updated_at: string
}

export type MindmapSnapshot = {
  id: string
  mindmap_id: string
  user_id: string
  doc_json: MindmapDoc
  created_at: string
}
