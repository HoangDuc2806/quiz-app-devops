import { getSupabaseAdmin } from '../lib/supabase.js';

export async function submitResult(req, res) {
  try {
    const { player_name, score, total, answers, time_seconds } = req.body;

    if (!player_name || score === undefined || total === undefined) {
      return res.status(400).json({ error: 'player_name, score, total are required' });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('results')
      .insert([{
        player_name,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        answers: answers || [],
        time_seconds: time_seconds || 0,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[submitResult]', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function listResults(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('results')
      .select('id, player_name, score, total, percentage, time_seconds, created_at')
      .order('percentage', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[listResults]', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function getStats(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('results')
      .select('score, total, percentage, time_seconds');

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.json({ total_attempts: 0, avg_score: 0, avg_percentage: 0, top_score: 0 });
    }

    const total_attempts = data.length;
    const avg_percentage = Math.round(data.reduce((s, r) => s + r.percentage, 0) / total_attempts);
    const top_score = Math.max(...data.map(r => r.percentage));
    const avg_time = Math.round(data.reduce((s, r) => s + (r.time_seconds || 0), 0) / total_attempts);

    res.json({ total_attempts, avg_percentage, top_score, avg_time_seconds: avg_time });
  } catch (err) {
    console.error('[getStats]', err.message);
    res.status(500).json({ error: err.message });
  }
}
