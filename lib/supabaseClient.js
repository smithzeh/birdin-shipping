import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rirnbinprxnscfrfwrqt.supabase.co'
const supabaseKey = 'sb_publishable_12CvBFHAfesHOwh5sKJKaA_iryIF9Mi'

export const supabase = createClient(supabaseUrl, supabaseKey)
