import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const { kidName, grade, typeName, correct, incorrect, total, accuracy, duration } = body

        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60

        // Send email via Resend (or fallback log)
        const resendKey = process.env.RESEND_API_KEY
        if (resendKey && resendKey !== 'your-resend-api-key') {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendKey}`,
                },
                body: JSON.stringify({
                    from: 'Math Gen <onboarding@resend.dev>',
                    to: [user.email],
                    subject: `📊 ${kidName}'s Math Practice Results - ${typeName}`,
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">🧮 Math Practice Report</h1>
              <hr style="border: 1px solid #e2e8f0;">
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 8px; color: #64748b;">Student</td><td style="padding: 8px; font-weight: bold;">${kidName}</td></tr>
                <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b;">Grade</td><td style="padding: 8px;">${grade}</td></tr>
                <tr><td style="padding: 8px; color: #64748b;">Topic</td><td style="padding: 8px;">${typeName}</td></tr>
                <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b;">Duration</td><td style="padding: 8px;">${minutes}m ${seconds}s</td></tr>
                <tr><td style="padding: 8px; color: #64748b;">Correct</td><td style="padding: 8px; color: #22c55e; font-weight: bold;">${correct}</td></tr>
                <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b;">Incorrect</td><td style="padding: 8px; color: #ef4444; font-weight: bold;">${incorrect}</td></tr>
                <tr><td style="padding: 8px; color: #64748b;">Total</td><td style="padding: 8px;">${total}</td></tr>
                <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b;">Accuracy</td><td style="padding: 8px; font-weight: bold; color: ${accuracy >= 80 ? '#22c55e' : accuracy >= 60 ? '#f97316' : '#ef4444'};">${accuracy}%</td></tr>
              </table>
              <p style="color: #94a3b8; font-size: 12px;">Sent by Math Worksheet Generator</p>
            </div>
          `,
                }),
            })

            if (!res.ok) {
                const errData = await res.json()
                console.error('Resend error:', errData)
                return NextResponse.json({ warning: 'Email failed but history saved', detail: errData }, { status: 200 })
            }
        } else {
            console.log('RESEND_API_KEY not configured. Email not sent. Results:', body)
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('Email API error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
