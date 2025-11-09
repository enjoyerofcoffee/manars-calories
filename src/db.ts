import { createClient } from '@supabase/supabase-js'
import { getConfig } from './config'

const {supabseUrl, anon} = getConfig()

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabseUrl, anon)