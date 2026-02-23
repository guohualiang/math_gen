'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getKids() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('kids')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching kids:', error)
        return []
    }

    return data || []
}

export async function addKid(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const name = formData.get('name') as string
    if (!name || name.trim().length === 0) return { error: 'Name is required' }

    const { error } = await supabase
        .from('kids')
        .insert({ parent_id: user.id, name: name.trim() })

    if (error) return { error: error.message }

    revalidatePath('/')
    return { success: true }
}

export async function deleteKid(kidId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('kids')
        .delete()
        .eq('id', kidId)
        .eq('parent_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/')
    return { success: true }
}

export async function saveHistory(data: {
    kid_id: string
    grade: string
    type_id: string
    type_name: string
    difficulty: number
    duration_seconds: number
    correct: number
    incorrect: number
    total: number
    accuracy: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('history')
        .insert({
            parent_id: user.id,
            kid_id: data.kid_id,
            grade: data.grade,
            type_id: data.type_id,
            type_name: data.type_name,
            difficulty: data.difficulty,
            duration_seconds: data.duration_seconds,
            correct: data.correct,
            incorrect: data.incorrect,
            total: data.total,
            accuracy: data.accuracy,
        })

    if (error) return { error: error.message }

    revalidatePath('/')
    return { success: true }
}

export async function getHistory(kidId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('kid_id', kidId)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching history:', error)
        return []
    }

    return data || []
}
