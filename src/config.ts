export const getConfig = () => ({
  supabseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  anon: import.meta.env.VITE_SUPABASE_ANON || "",
})