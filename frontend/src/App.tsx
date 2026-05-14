<<<<<<< HEAD
=======
// Frontend Engineer: Tu - Main App Component
// Screens: Home, Quiz, Result, Leaderboard, Admin
>>>>>>> f9e48d7d2c3938b60d853b591d2360dda5d83088
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Question, Result, Stats, AnswerRecord, QuizPhase } from './types';
import { apiFetch } from './lib/api';

// ── Utility ──────────────────────────────────────────────────────────────────
function fmt(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function grade(pct: number) {
  if (pct >= 90) return { label: 'Xuất sắc 🏆', color: '#22c55e' };
  if (pct >= 70) return { label: 'Giỏi 🎉', color: '#3b82f6' };
  if (pct >= 50) return { label: 'Trung bình 👍', color: '#f59e0b' };
  return { label: 'Cần cố gắng 💪', color: '#ef4444' };
}

// ── Home Screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onStart, onLeaderboard, onAdmin, stats }:
  { onStart: (name: string) => void; onLeaderboard: () => void; onAdmin: () => void; stats: Stats | null }) {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  const start = () => {
    if (!name.trim()) { setErr('Vui lòng nhập tên!'); return; }
    onStart(name.trim());
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🧠</div>
        <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>QuizMaster</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>Thử thách kiến thức của bạn!</p>

        {stats && stats.total_attempts > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Lượt thi', val: stats.total_attempts },
              { label: 'TB điểm', val: `${stats.avg_percentage}%` },
              { label: 'Cao nhất', val: `${stats.top_score}%` },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 8px' }}>
                <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 20 }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        <input
          value={name}
          onChange={e => { setName(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && start()}
          placeholder="Nhập tên của bạn..."
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: err ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 16, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
        />
        {err && <p style={{ color: '#f87171', fontSize: 13, margin: '0 0 8px' }}>{err}</p>}

        <button onClick={start} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 700, cursor: 'pointer', marginBottom: 12 }}>
          Bắt đầu Quiz 🚀
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onLeaderboard} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>
            🏆 Bảng xếp hạng
          </button>
          <button onClick={onAdmin} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>
            ⚙️ Quản lý
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quiz Screen ───────────────────────────────────────────────────────────────
function QuizScreen({ questions, playerName, onFinish }:
  { questions: Question[]; playerName: string; onFinish: (answers: AnswerRecord[], time: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [timer, setTimer] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const q = questions[idx];
  const progress = ((idx) / questions.length) * 100;

  const confirm = () => {
    if (selected === null) return;
    setConfirmed(true);
  };

  const next = () => {
    const record: AnswerRecord = { question_id: q.id, selected: selected!, correct: selected === q.correct_index };
    const newAnswers = [...answers, record];
    if (idx + 1 >= questions.length) {
      clearInterval(intervalRef.current);
      onFinish(newAnswers, timer);
    } else {
      setAnswers(newAnswers);
      setIdx(i => i + 1);
      setSelected(null);
      setConfirmed(false);
    }
  };

  const optionStyle = (i: number): React.CSSProperties => {
    let bg = 'rgba(255,255,255,0.05)';
    let border = '2px solid rgba(255,255,255,0.1)';
    if (confirmed) {
      if (i === q.correct_index) { bg = 'rgba(34,197,94,0.2)'; border = '2px solid #22c55e'; }
      else if (i === selected) { bg = 'rgba(239,68,68,0.2)'; border = '2px solid #ef4444'; }
    } else if (i === selected) {
      bg = 'rgba(124,58,237,0.3)'; border = '2px solid #7c3aed';
    }
    return { padding: '14px 18px', borderRadius: 12, background: bg, border, color: '#fff', cursor: confirmed ? 'default' : 'pointer', textAlign: 'left', width: '100%', fontSize: 15, marginBottom: 8, transition: 'all 0.2s' };
  };

  const diffColor = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }[q.difficulty] || '#888';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>👤 {playerName}</span>
          <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: 18 }}>⏱ {fmt(timer)}</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{idx + 1}/{questions.length}</span>
        </div>

        {/* Progress */}
        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', transition: 'width 0.3s' }} />
        </div>

        {/* Question card */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '4px 10px', borderRadius: 99, fontSize: 12 }}>{q.category}</span>
            <span style={{ background: 'rgba(0,0,0,0.3)', color: diffColor, padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{q.difficulty}</span>
          </div>

          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 24, lineHeight: 1.5 }}>{q.text}</h2>

          <div>
            {q.options.map((opt, i) => (
              <button key={i} style={optionStyle(i)} onClick={() => !confirmed && setSelected(i)}>
                <span style={{ marginRight: 10, opacity: 0.6 }}>{'ABCD'[i]}.</span>{opt}
                {confirmed && i === q.correct_index && <span style={{ float: 'right' }}>✅</span>}
                {confirmed && i === selected && i !== q.correct_index && <span style={{ float: 'right' }}>❌</span>}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            {!confirmed ? (
              <button onClick={confirm} disabled={selected === null} style={{ padding: '12px 28px', background: selected === null ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: selected === null ? 'not-allowed' : 'pointer', fontSize: 16 }}>
                Xác nhận
              </button>
            ) : (
              <button onClick={next} style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
                {idx + 1 >= questions.length ? 'Nộp bài 🎯' : 'Câu tiếp theo →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Result Screen ─────────────────────────────────────────────────────────────
function ResultScreen({ score, total, time, pct, playerName, onHome, onLeaderboard }:
  { score: number; total: number; time: number; pct: number; playerName: string; onHome: () => void; onLeaderboard: () => void }) {
  const { label, color } = grade(pct);
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 48, maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>
          {pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 style={{ color: '#fff', fontSize: 28, margin: '0 0 4px' }}>{playerName}</h2>
        <p style={{ color, fontWeight: 700, fontSize: 18, margin: '0 0 32px' }}>{label}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Điểm số', val: `${score}/${total}` },
            { label: 'Tỉ lệ', val: `${pct}%` },
            { label: 'Thời gian', val: fmt(time) },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 22 }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{label}</div>
            </div>
          ))}
        </div>

        <button onClick={onLeaderboard} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 16, marginBottom: 10 }}>
          🏆 Xem bảng xếp hạng
        </button>
        <button onClick={onHome} style={{ width: '100%', padding: 14, background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
          🏠 Về trang chủ
        </button>
      </div>
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function LeaderboardScreen({ results, onBack }: { results: Result[]; onBack: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', padding: 20 }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 16px', borderRadius: 10, cursor: 'pointer' }}>← Quay lại</button>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 24 }}>🏆 Bảng Xếp Hạng</h2>
        </div>
        {results.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Chưa có kết quả nào</p>
        ) : (
          results.map((r, i) => (
            <div key={r.id} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : 'rgba(255,255,255,0.1)'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 24, minWidth: 36, textAlign: 'center' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{r.player_name}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{r.score}/{r.total} câu · {fmt(r.time_seconds)}</div>
              </div>
              <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: 22 }}>{r.percentage}%</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Admin Screen ──────────────────────────────────────────────────────────────
function AdminScreen({ onBack }: { onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ text: '', opt0: '', opt1: '', opt2: '', opt3: '', correct_index: 0, category: 'General', difficulty: 'medium' });
  const [msg, setMsg] = useState('');

  const loadQuestions = useCallback(async () => {
    const data = await apiFetch<Question[]>('/api/questions');
    setQuestions(data);
  }, []);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  const submit = async () => {
    const { text, opt0, opt1, opt2, opt3, correct_index, category, difficulty } = form;
    if (!text || !opt0 || !opt1) { setMsg('❌ Cần nhập câu hỏi và ít nhất 2 đáp án'); return; }
    setLoading(true);
    try {
      const options = [opt0, opt1, opt2, opt3].filter(Boolean);
      await apiFetch('/api/questions', { method: 'POST', body: JSON.stringify({ text, options, correct_index, category, difficulty }) });
      setMsg('✅ Đã thêm câu hỏi!');
      setForm({ text: '', opt0: '', opt1: '', opt2: '', opt3: '', correct_index: 0, category: 'General', difficulty: 'medium' });
      await loadQuestions();
    } catch (e: unknown) {
      setMsg(`❌ ${e instanceof Error ? e.message : 'Lỗi'}`);
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    await apiFetch(`/api/questions/${id}`, { method: 'DELETE' });
    await loadQuestions();
  };

  const inp = (style?: React.CSSProperties): React.CSSProperties => ({
    padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, width: '100%', boxSizing: 'border-box', ...style
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', padding: 20 }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 16px', borderRadius: 10, cursor: 'pointer' }}>← Quay lại</button>
          <h2 style={{ color: '#fff', margin: 0 }}>⚙️ Quản lý câu hỏi</h2>
        </div>

        {/* Add form */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#fff', margin: '0 0 16px' }}>➕ Thêm câu hỏi</h3>
          <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Nội dung câu hỏi..." rows={3} style={{ ...inp(), marginBottom: 10, resize: 'vertical' }} />
          {['opt0', 'opt1', 'opt2', 'opt3'].map((k, i) => (
            <input key={k} value={(form as Record<string, string | number>)[k] as string} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={`Đáp án ${['A', 'B', 'C', 'D'][i]}${i < 2 ? ' *' : ''}`} style={{ ...inp(), marginBottom: 8 }} />
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            <select value={form.correct_index} onChange={e => setForm(f => ({ ...f, correct_index: Number(e.target.value) }))} style={inp()}>
              {['A', 'B', 'C', 'D'].map((l, i) => <option key={i} value={i} style={{ background: '#1e1b4b' }}>Đúng: {l}</option>)}
            </select>
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Chủ đề" style={inp()} />
            <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} style={inp()}>
              {['easy', 'medium', 'hard'].map(d => <option key={d} value={d} style={{ background: '#1e1b4b' }}>{d}</option>)}
            </select>
          </div>
          {msg && <p style={{ color: msg.startsWith('✅') ? '#22c55e' : '#f87171', fontSize: 14, margin: '0 0 12px' }}>{msg}</p>}
          <button onClick={submit} disabled={loading} style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Đang thêm...' : 'Thêm câu hỏi'}
          </button>
        </div>

        {/* Questions list */}
        <h3 style={{ color: '#fff', margin: '0 0 12px' }}>📋 Danh sách ({questions.length} câu)</h3>
        {questions.map((q, i) => (
          <div key={q.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px', marginBottom: 8, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ color: '#a78bfa', minWidth: 24 }}>{i + 1}.</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', margin: '0 0 4px', fontSize: 14 }}>{q.text}</p>
              <span style={{ color: '#22c55e', fontSize: 12 }}>✓ {q.options[q.correct_index]}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginLeft: 12 }}>{q.category} · {q.difficulty}</span>
            </div>
            <button onClick={() => del(q.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState<QuizPhase>('home');
  const [playerName, setPlayerName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [lastResult, setLastResult] = useState<{ score: number; total: number; time: number; pct: number } | null>(null);
  const [loadErr, setLoadErr] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [q, r, s] = await Promise.all([
        apiFetch<Question[]>('/api/questions'),
        apiFetch<Result[]>('/api/results'),
        apiFetch<Stats>('/api/results/stats'),
      ]);
      setQuestions(q);
      setResults(r);
      setStats(s);
      setLoadErr('');
    } catch (e: unknown) {
      setLoadErr(e instanceof Error ? e.message : 'Lỗi kết nối API');
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStart = (name: string) => {
    if (questions.length === 0) { alert('Chưa có câu hỏi! Vui lòng thêm câu hỏi trong phần Quản lý.'); return; }
    setPlayerName(name);
    setPhase('quiz');
  };

  const handleFinish = async (answers: AnswerRecord[], time: number) => {
    const score = answers.filter(a => a.correct).length;
    const total = answers.length;
    const pct = Math.round((score / total) * 100);
    setLastResult({ score, total, time, pct });
    try {
      await apiFetch('/api/results', { method: 'POST', body: JSON.stringify({ player_name: playerName, score, total, answers, time_seconds: time }) });
      await loadData();
    } catch (e) { console.error('Submit error', e); }
    setPhase('result');
  };

  if (loadErr) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 32, textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ color: '#f87171', margin: '8px 0' }}>Lỗi kết nối</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>{loadErr}</p>
          <button onClick={loadData} style={{ padding: '10px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Thử lại</button>
        </div>
      </div>
    );
  }

  if (phase === 'home') return <HomeScreen onStart={handleStart} onLeaderboard={() => setPhase('leaderboard')} onAdmin={() => setPhase('admin')} stats={stats} />;
  if (phase === 'quiz') return <QuizScreen questions={questions} playerName={playerName} onFinish={handleFinish} />;
  if (phase === 'result' && lastResult) return <ResultScreen {...lastResult} playerName={playerName} onHome={() => setPhase('home')} onLeaderboard={() => setPhase('leaderboard')} />;
  if (phase === 'leaderboard') return <LeaderboardScreen results={results} onBack={() => setPhase('home')} />;
  if (phase === 'admin') return <AdminScreen onBack={() => setPhase('home')} />;
  return null;
}
