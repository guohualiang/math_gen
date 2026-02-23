import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getKids } from '@/app/actions'
import Dashboard from '@/components/Dashboard'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const kids = await getKids()

  return <Dashboard user={user} kids={kids} />
}
