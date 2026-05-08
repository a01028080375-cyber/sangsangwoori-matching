export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import RegisterForm from './RegisterForm'

export default async function RegisterPage() {
  const { data: seniors } = await supabase
    .from('seniors')
    .select('id, name, region, desired_job, career_years')
    .order('created_at', { ascending: false })

  return <RegisterForm initialSeniors={seniors ?? []} />
}
