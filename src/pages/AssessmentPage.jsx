import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import {
    ClipboardCheck, CheckCircle, XCircle, RotateCcw,
    ArrowRight, Loader, AlertCircle, Trophy, BookOpen
} from 'lucide-react';

export default function AssessmentPage() {
    const { connectionId } = useParams();
    const [searchParams] = useSearchParams();
    const skillId = searchParams.get('skillId');
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [currentQ, setCurrentQ] = useState(0);

    useEffect(() => {
        loadQuestions();
    }, [skillId]);

    const loadQuestions = async () => {
        if (!skillId) { setError('Skill ID missing.'); setLoading(false); return; }
        setLoading(true);
        setError('');
        setResult(null);
        setAnswers({});
        setCurrentQ(0);
        try {
            const data = await assessmentAPI.getQuestions(skillId);
            setQuestions(data.questions || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load questions. Make sure questions are seeded in the database.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleSubmit = async () => {
        const unanswered = questions.filter(q => !answers[q.id]);
        if (unanswered.length > 0) {
            if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) return;
        }
        setSubmitting(true);
        try {
            const payload = {
                connection_id: connectionId,
                skill_id: skillId,
                answers: questions.map(q => ({
                    question_id: q.id,
                    selected_answer: answers[q.id] || '',
                })),
            };
            const data = await assessmentAPI.submitAssessment(payload);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit assessment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    // ─── LOADING ───────────────────────────────────────────────
    if (loading) {
        return (
            <div style={styles.centerBox}>
                <div style={styles.spinner} />
                <p style={{ color: '#64748b', fontWeight: 600, marginTop: '1rem' }}>Loading assessment...</p>
                <style>{spinCSS}</style>
            </div>
        );
    }

    // ─── ERROR ─────────────────────────────────────────────────
    if (error && !result) {
        return (
            <div style={styles.centerBox}>
                <AlertCircle size={48} color="#ef4444" />
                <p style={{ color: '#ef4444', fontWeight: 600, marginTop: '1rem', textAlign: 'center' }}>{error}</p>
                <button onClick={() => navigate('/my-skills')} style={styles.btnPrimary}>
                    Back to My Skills
                </button>
            </div>
        );
    }

    // ─── RESULT SCREEN ─────────────────────────────────────────
    if (result) {
        const passed = result.passed;
        return (
            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{
                    background: '#fff', borderRadius: '1.5rem',
                    boxShadow: '0 8px 40px rgba(99,102,241,0.12)',
                    border: `2px solid ${passed ? '#10b981' : '#ef4444'}`,
                    overflow: 'hidden', textAlign: 'center',
                }}>
                    {/* Result header */}
                    <div style={{
                        background: passed
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        padding: '2.5rem 2rem',
                    }}>
                        {passed ? (
                            <Trophy size={56} color="#fff" style={{ margin: '0 auto' }} />
                        ) : (
                            <XCircle size={56} color="#fff" style={{ margin: '0 auto' }} />
                        )}
                        <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginTop: '1rem' }}>
                            {passed ? 'Assessment Passed! 🎉' : 'Assessment Failed'}
                        </h2>
                    </div>

                    {/* Score */}
                    <div style={{ padding: '2rem' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'baseline', gap: '0.25rem',
                            background: passed ? '#f0fdf4' : '#fef2f2',
                            borderRadius: '1rem', padding: '1rem 2rem',
                            border: `1.5px solid ${passed ? '#bbf7d0' : '#fecaca'}`,
                            marginBottom: '1.5rem',
                        }}>
                            <span style={{ fontSize: '3rem', fontWeight: 900, color: passed ? '#059669' : '#dc2626' }}>
                                {result.score}
                            </span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#94a3b8' }}>/{result.total}</span>
                        </div>

                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                            You scored <strong>{result.score}/{result.total}</strong> ({result.percentage}%)
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            {passed
                                ? '✅ Credits have been automatically transferred to your teacher.'
                                : '❌ You need at least 70% (14/20) to pass. Please retake the assessment.'}
                        </p>

                        {/* Circular progress */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                                <circle
                                    cx="60" cy="60" r="52" fill="none"
                                    stroke={passed ? '#10b981' : '#ef4444'} strokeWidth="10"
                                    strokeDasharray={`${2 * Math.PI * 52}`}
                                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - result.percentage / 100)}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                                />
                                <text x="60" y="60" textAnchor="middle" dy="0.35em"
                                    fill={passed ? '#059669' : '#dc2626'}
                                    fontSize="20" fontWeight="800">
                                    {result.percentage}%
                                </text>
                            </svg>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {passed ? (
                                <button
                                    onClick={() => navigate('/my-skills')}
                                    style={{ ...styles.btnPrimary, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                                >
                                    <CheckCircle size={16} /> Go to My Learning
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={loadQuestions}
                                        style={{ ...styles.btnPrimary, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                    >
                                        <RotateCcw size={16} /> Retake Assessment
                                    </button>
                                    <button
                                        onClick={() => navigate('/my-skills')}
                                        style={{ ...styles.btnSecondary }}
                                    >
                                        Back to My Skills
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── ASSESSMENT SCREEN ─────────────────────────────────────
    const q = questions[currentQ];
    const options = q ? [
        { key: 'A', label: q.option_a },
        { key: 'B', label: q.option_b },
        { key: 'C', label: q.option_c },
        { key: 'D', label: q.option_d },
    ] : [];

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem 1rem' }}>
            <style>{spinCSS}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <ClipboardCheck size={20} color="#fff" />
                </div>
                <div>
                    <h2 style={{ fontWeight: 800, fontSize: '1.375rem', color: '#1e1b4b', margin: 0 }}>
                        Skill Assessment
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.8125rem', margin: 0 }}>
                        20 questions · Pass with 70% or above
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
                        Question {currentQ + 1} of {questions.length}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#6366f1', fontWeight: 700 }}>
                        {answeredCount} / {questions.length} answered
                    </span>
                </div>
                <div style={{ height: '8px', borderRadius: '9999px', background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease',
                    }} />
                </div>
            </div>

            {/* Question Card */}
            {q && (
                <div style={{
                    background: '#fff', borderRadius: '1.25rem',
                    boxShadow: '0 4px 24px rgba(99,102,241,0.1)',
                    border: '1.5px solid rgba(99,102,241,0.08)',
                    padding: '1.75rem', marginBottom: '1.25rem',
                }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <span style={{
                            minWidth: '32px', height: '32px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.875rem', fontWeight: 800,
                        }}>
                            {currentQ + 1}
                        </span>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.5, margin: 0 }}>
                            {q.question}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {options.map(opt => {
                            const selected = answers[q.id] === opt.key;
                            return (
                                <button
                                    key={opt.key}
                                    onClick={() => handleSelect(q.id, opt.key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                                        textAlign: 'left', padding: '0.875rem 1.125rem',
                                        borderRadius: '0.875rem', cursor: 'pointer',
                                        border: selected ? '2px solid #6366f1' : '2px solid #e2e8f0',
                                        background: selected ? 'linear-gradient(135deg, #eef2ff, #f5f3ff)' : '#f8fafc',
                                        transition: 'all 0.15s ease',
                                        fontFamily: 'inherit',
                                        fontWeight: selected ? 700 : 500,
                                        color: selected ? '#4338ca' : '#374151',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    <span style={{
                                        minWidth: '28px', height: '28px', borderRadius: '50%',
                                        background: selected ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e2e8f0',
                                        color: selected ? '#fff' : '#64748b',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 800,
                                        transition: 'all 0.15s ease',
                                    }}>
                                        {opt.key}
                                    </span>
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                    onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                    disabled={currentQ === 0}
                    style={{
                        ...styles.btnSecondary,
                        opacity: currentQ === 0 ? 0.4 : 1,
                        cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
                    }}
                >
                    ← Previous
                </button>

                {currentQ < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrentQ(q => q + 1)}
                        style={{ ...styles.btnPrimary, flex: 1 }}
                    >
                        Next Question <ArrowRight size={16} />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            ...styles.btnPrimary,
                            flex: 1,
                            background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: submitting ? 'none' : '0 4px 16px rgba(16,185,129,0.35)',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {submitting ? (
                            <><div style={{ ...styles.spinner, width: '16px', height: '16px', marginRight: '0.5rem' }} /> Submitting...</>
                        ) : (
                            <><ClipboardCheck size={16} /> Submit Assessment</>
                        )}
                    </button>
                )}
            </div>

            {/* Question dots navigation */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '1.25rem', justifyContent: 'center' }}>
                {questions.map((q, idx) => (
                    <button
                        key={q.id}
                        onClick={() => setCurrentQ(idx)}
                        title={`Question ${idx + 1}${answers[q.id] ? ' ✓' : ''}`}
                        style={{
                            width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                            cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
                            background: idx === currentQ
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : answers[q.id] ? '#d1fae5' : '#f1f5f9',
                            color: idx === currentQ ? '#fff' : answers[q.id] ? '#065f46' : '#94a3b8',
                            transition: 'all 0.15s',
                        }}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Shared styles ──────────────────────────────────────────────────
const styles = {
    centerBox: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: '1rem', padding: '2rem',
    },
    spinner: {
        width: '40px', height: '40px', borderRadius: '50%',
        border: '4px solid #e0e7ff', borderTopColor: '#6366f1',
        animation: 'spin 0.8s linear infinite',
    },
    btnPrimary: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff', border: 'none', borderRadius: '0.875rem',
        padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.9rem',
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 4px 16px rgba(99,102,241,0.28)',
        transition: 'all 0.2s',
    },
    btnSecondary: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        background: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0',
        borderRadius: '0.875rem', padding: '0.75rem 1.25rem',
        fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.2s',
    },
};

const spinCSS = `@keyframes spin { to { transform: rotate(360deg); } }`;
