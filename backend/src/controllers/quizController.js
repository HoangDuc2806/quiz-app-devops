import { getSupabaseAdmin } from '../lib/supabase.js';

export async function listQuestions(_req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('questions')
      .select('id, text, options, category, difficulty, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[listQuestions]', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function getQuestion(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Question not found' });
    res.json(data);
  } catch (err) {
    console.error('[getQuestion]', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function createQuestion(req, res) {
  try {
    const { text, options, correct_index, category, difficulty } = req.body;

    if (!text || !options || correct_index === undefined) {
      return res.status(400).json({ error: 'text, options, correct_index are required' });
    }
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'options must be an array with at least 2 items' });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('questions')
      .insert([{ text, options, correct_index, category: category || 'General', difficulty: difficulty || 'medium' }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[createQuestion]', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ deleted: true });
  } catch (err) {
    console.error('[deleteQuestion]', err.message);
    res.status(500).json({ error: err.message });
  }
}
