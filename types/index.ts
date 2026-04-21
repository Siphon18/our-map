export type Photo = {
  id: string
  couple_id: string
  uploaded_by: string
  storage_path: string
  thumbnail_path: string
  filename: string
  title: string | null
  note: string | null
  category: 'memory' | 'us' | 'me' | 'them' | 'dream'
  lat: number | null
  lng: number | null
  has_gps: boolean
  taken_at: string | null
  created_at: string
}

export type Couple = {
  id: string
  invite_code: string
  created_at: string
}

export type CoupleMember = {
  id: string
  couple_id: string
  user_id: string
  nickname: string
  joined_at: string
}
