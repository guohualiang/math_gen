'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { curriculum, gradeNames, difficultyNames, generateProblems, type Problem } from '@/lib/math-engine'
import { addKid, deleteKid, saveHistory, getHistory } from '@/app/actions'
import { logout } from '@/app/auth/actions'

interface Kid { id: string; name: string; parent_id: string; created_at: string }
interface HistoryItem {
    id: string; kid_id: string; grade: string; type_id: string; type_name: string
    difficulty: number; duration_seconds: number; correct: number; incorrect: number
    total: number; accuracy: number; created_at: string
}

export default function Dashboard({ user, kids: initialKids }: { user: User; kids: Kid[] }) {
    const [kids, setKids] = useState<Kid[]>(initialKids)
    const [selectedKid, setSelectedKid] = useState<string>(initialKids[0]?.id || '')
    const [grade, setGrade] = useState('1')
    const [type, setType] = useState(curriculum['1'][0].id)
    const [diff, setDiff] = useState(2)
    const [count, setCount] = useState(20)
    const [problems, setProblems] = useState<Problem[]>([])
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [checked, setChecked] = useState<Record<number, boolean | null>>({})
    const [score, setScore] = useState({ correct: 0, incorrect: 0, total: 0 })
    const [timerSeconds, setTimerSeconds] = useState(0)
    const [timerRunning, setTimerRunning] = useState(false)
    const [showKidModal, setShowKidModal] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [newKidName, setNewKidName] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startTimeRef = useRef<number | null>(null)

    // Timer effect
    useEffect(() => {
        if (timerRunning) {
            timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
        } else if (timerRef.current) {
            clearInterval(timerRef.current)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [timerRunning])

    const handleGradeChange = (g: string) => {
        setGrade(g)
        setType(curriculum[g][0].id)
    }

    const generate = () => {
        const p = generateProblems(type, diff, count)
        setProblems(p)
        setAnswers({})
        setChecked({})
        setScore({ correct: 0, incorrect: 0, total: 0 })
        setTimerSeconds(0)
        setTimerRunning(true)
        startTimeRef.current = Date.now()
    }

    const checkAnswer = (index: number, value: string) => {
        setAnswers(prev => ({ ...prev, [index]: value }))
        if (!value.trim()) { setChecked(prev => ({ ...prev, [index]: null })); return }

        const normalize = (s: string | number) => String(s).replace(/\s+/g, '').toLowerCase()
        const isCorrect = normalize(value) === normalize(problems[index].answer)

        if (checked[index] === undefined || checked[index] === null) {
            setScore(prev => ({
                correct: prev.correct + (isCorrect ? 1 : 0),
                incorrect: prev.incorrect + (isCorrect ? 0 : 1),
                total: prev.total + 1,
            }))
        }
        setChecked(prev => ({ ...prev, [index]: isCorrect }))
    }

    const handleSubmit = useCallback(async () => {
        if (!selectedKid) { alert('Please select a kid first'); return }
        setSubmitting(true)
        setTimerRunning(false)

        const duration = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : timerSeconds
        const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
        const typeName = curriculum[grade].find(t => t.id === type)?.nameEn || type
        const kidName = kids.find(k => k.id === selectedKid)?.name || ''

        await saveHistory({
            kid_id: selectedKid,
            grade,
            type_id: type,
            type_name: typeName,
            difficulty: diff,
            duration_seconds: duration,
            correct: score.correct,
            incorrect: score.incorrect,
            total: score.total,
            accuracy,
        })

        // Send email notification
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kidName, grade: gradeNames[grade].en, typeName,
                    correct: score.correct, incorrect: score.incorrect,
                    total: score.total, accuracy, duration,
                }),
            })
        } catch (e) { console.error('Email failed:', e) }

        alert(`Practice completed!\n\nCorrect: ${score.correct}\nIncorrect: ${score.incorrect}\nAccuracy: ${accuracy}%\n\nHistory saved.`)
        setSubmitting(false)
    }, [selectedKid, score, grade, type, diff, timerSeconds, kids])

    const handleAddKid = async () => {
        if (!newKidName.trim()) return
        const formData = new FormData()
        formData.append('name', newKidName)
        const result = await addKid(formData)
        if (result.success) {
            setNewKidName('')
            // Reload kids
            window.location.reload()
        }
    }

    const handleDeleteKid = async (kidId: string) => {
        if (!confirm('Delete this kid? All history will be kept.')) return
        await deleteKid(kidId)
        window.location.reload()
    }

    const loadHistory = async () => {
        if (!selectedKid) { alert('Please select a kid first'); return }
        const h = await getHistory(selectedKid)
        setHistory(h)
        setShowHistoryModal(true)
    }

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-4 text-white shadow-lg">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">🧮 Math Worksheet Generator</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-blue-100">{user.email}</span>
                        <button onClick={() => setShowKidModal(true)} className="cursor-pointer rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium transition hover:bg-white/30">
                            👤 Kids
                        </button>
                        <button onClick={loadHistory} className="cursor-pointer rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium transition hover:bg-white/30">
                            📊 History
                        </button>
                        <form action={logout}>
                            <button className="cursor-pointer rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium transition hover:bg-white/30">
                                Logout
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Controls */}
            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="rounded-2xl bg-white p-6 shadow-md">
                    <div className="flex flex-wrap items-end gap-4">
                        {/* Kid Selector */}
                        <div className="min-w-[150px]">
                            <label className="mb-1 block text-sm font-medium text-slate-600">Student</label>
                            <select value={selectedKid} onChange={e => setSelectedKid(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                <option value="">-- Select --</option>
                                {kids.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                            </select>
                        </div>

                        {/* Grade */}
                        <div className="min-w-[120px]">
                            <label className="mb-1 block text-sm font-medium text-slate-600">Grade</label>
                            <select value={grade} onChange={e => handleGradeChange(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                {Object.keys(curriculum).map(g => <option key={g} value={g}>{gradeNames[g].en}</option>)}
                            </select>
                        </div>

                        {/* Topic */}
                        <div className="min-w-[180px]">
                            <label className="mb-1 block text-sm font-medium text-slate-600">Topic</label>
                            <select value={type} onChange={e => setType(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                {curriculum[grade].map(t => <option key={t.id} value={t.id}>{t.nameEn}</option>)}
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div className="min-w-[120px]">
                            <label className="mb-1 block text-sm font-medium text-slate-600">Difficulty</label>
                            <select value={diff} onChange={e => setDiff(Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                {[1, 2, 3, 4].map(d => <option key={d} value={d}>{difficultyNames[d].en}</option>)}
                            </select>
                        </div>

                        {/* Count */}
                        <div className="min-w-[100px]">
                            <label className="mb-1 block text-sm font-medium text-slate-600">Count</label>
                            <select value={count} onChange={e => setCount(Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                {[10, 20, 30, 40].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <button onClick={generate}
                            className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                            🎲 Generate
                        </button>
                    </div>
                </div>

                {/* Timer & Score */}
                {problems.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="rounded-lg bg-white px-4 py-2 shadow-sm">
                            <span className="text-sm text-slate-500">⏱️ </span>
                            <span className="font-mono text-lg font-bold text-slate-800">{formatTime(timerSeconds)}</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">✓ {score.correct}</span>
                            <span className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">✗ {score.incorrect}</span>
                            <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                                {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                            </span>
                        </div>
                        <button onClick={handleSubmit} disabled={submitting || score.total === 0}
                            className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">
                            {submitting ? 'Saving...' : '✅ Submit'}
                        </button>
                    </div>
                )}

                {/* Problems Grid */}
                {problems.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {problems.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm">
                                <span className="w-8 text-right text-sm font-bold text-slate-400">{i + 1}.</span>
                                <span className="min-w-[180px] font-mono text-lg">{p.display}</span>
                                <input
                                    type="text"
                                    value={answers[i] || ''}
                                    onChange={e => { setAnswers(prev => ({ ...prev, [i]: e.target.value })) }}
                                    onBlur={e => checkAnswer(i, e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') checkAnswer(i, (e.target as HTMLInputElement).value) }}
                                    className={`w-24 rounded border px-2 py-1 text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${checked[i] === true ? 'border-green-500 bg-green-50' :
                                            checked[i] === false ? 'border-red-500 bg-red-50' :
                                                'border-slate-300'
                                        }`}
                                />
                                {checked[i] === true && <span className="text-green-600 font-bold">✓</span>}
                                {checked[i] === false && <span className="text-red-600 font-bold">✗</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Kids Modal */}
            {showKidModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">👤 Manage Kids</h2>
                            <button onClick={() => setShowKidModal(false)} className="cursor-pointer text-2xl text-slate-400 hover:text-slate-600">&times;</button>
                        </div>

                        <div className="mb-4 flex gap-2">
                            <input value={newKidName} onChange={e => setNewKidName(e.target.value)} placeholder="Enter kid name"
                                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                            <button onClick={handleAddKid} className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Add</button>
                        </div>

                        <div className="max-h-64 space-y-2 overflow-y-auto">
                            {kids.length === 0 && <p className="py-4 text-center text-slate-400">No kids added yet</p>}
                            {kids.map(k => (
                                <div key={k.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                                    <span className="font-medium text-slate-700">{k.name}</span>
                                    <button onClick={() => handleDeleteKid(k.id)} className="cursor-pointer text-sm text-red-500 hover:text-red-700">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">📊 Practice History</h2>
                            <button onClick={() => setShowHistoryModal(false)} className="cursor-pointer text-2xl text-slate-400 hover:text-slate-600">&times;</button>
                        </div>

                        <div className="max-h-[60vh] overflow-auto">
                            {history.length === 0 ? (
                                <p className="py-8 text-center text-slate-400">No history yet</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-left text-slate-500">
                                            <th className="px-2 py-2">Date</th>
                                            <th className="px-2 py-2">Grade</th>
                                            <th className="px-2 py-2">Topic</th>
                                            <th className="px-2 py-2">Difficulty</th>
                                            <th className="px-2 py-2">Duration</th>
                                            <th className="px-2 py-2">Score</th>
                                            <th className="px-2 py-2">Accuracy</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map(h => (
                                            <tr key={h.id} className="border-b border-slate-100">
                                                <td className="px-2 py-2 text-slate-600">{new Date(h.created_at).toLocaleString()}</td>
                                                <td className="px-2 py-2">{gradeNames[h.grade]?.en || h.grade}</td>
                                                <td className="px-2 py-2">{h.type_name}</td>
                                                <td className="px-2 py-2">{difficultyNames[h.difficulty]?.en || h.difficulty}</td>
                                                <td className="px-2 py-2">{formatTime(h.duration_seconds)}</td>
                                                <td className="px-2 py-2">{h.correct}/{h.total}</td>
                                                <td className={`px-2 py-2 font-semibold ${h.accuracy >= 80 ? 'text-green-600' : h.accuracy >= 60 ? 'text-orange-500' : 'text-red-600'}`}>
                                                    {h.accuracy}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
