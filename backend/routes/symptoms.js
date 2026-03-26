// symptoms.js - Send clean input to n8n, get AI recommendations back
const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const { protect } = require('../middleware/auth');
const { analyzeSymptoms } = require('../services/aiService');
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ============================================================
// POST /api/symptoms/check
// 1) Decode user from JWT (no DB call)
// 2) Run local AI for risk_level + conditions (for display)
// 3) Send CLEAN payload (user + input only) to n8n → wait for response
// 4) Return: local conditions + n8n recommendations to frontend
// ============================================================
router.post('/check', async (req, res) => {
  const { symptoms = [], prompt = '' } = req.body;

  const hasSymptoms = Array.isArray(symptoms) && symptoms.length > 0;
  const hasPrompt = typeof prompt === 'string' && prompt.trim().length > 0;

  if (!hasSymptoms && !hasPrompt)
    return res.status(400).json({ message: 'Please select symptoms or describe them in the prompt.' });

  // ---- Decode JWT (sync, no DB) ----
  let userInfo = { id: null, name: 'Guest', email: null, age: null, blood_group: null };
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      userInfo.id = decoded.id;
      userInfo.name = decoded.name;
      userInfo.email = decoded.email;
    } catch (e) { /* guest */ }
  }

  // ---- Local AI engine (for risk level + conditions display) ----
  let analysis = { risk_level: 'low', possible_diseases: [], recommendations: [], first_aid_needed: false, seek_emergency: false, total_matches: 0 };
  try {
    analysis = await analyzeSymptoms(hasSymptoms ? symptoms : []);
  } catch (e) {
    console.log('AI engine note:', e.message);
  }

  // ---- Fetch user profile BEFORE building payload (age, blood_group) ----
  if (userInfo.id) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('age, blood_group')
        .eq('id', userInfo.id)
        .single();
      if (profile) {
        userInfo.age = profile.age;
        userInfo.blood_group = profile.blood_group;
      }
    } catch (e) { console.log('Profile fetch note:', e.message); }
  }

  // ---- Build n8n payload ----
  const symptomData = {
    user_id: userInfo.id,
    name: userInfo.name,
    email: userInfo.email,
    age: userInfo.age,
    blood_group: userInfo.blood_group,
    Symptoms: hasSymptoms ? symptoms : [], // Original Array (important for n8n schema)
    prompt: hasPrompt ? prompt.trim() : '',   // Original prompt string
    full_description: buildDescription(symptoms, prompt) // Unified description for AI
  };
  
  const n8nPayload = {
    action: 'symptom_checking',
    symptom_checking: symptomData
  };
  const timestamp = new Date().toISOString();

  // ---- Send to n8n and WAIT for AI response ----
  let n8nResponse = null;
  let n8nNotified = false;

  if (process.env.N8N_WEBHOOK_URL) {
    try {
      const response = await axios.post(process.env.N8N_WEBHOOK_URL, n8nPayload, {
        timeout: 45000, // wait up to 30s for n8n AI to respond
        headers: { 'Content-Type': 'application/json' }
      });
      n8nResponse = response.data;
      n8nNotified = true;
      console.log('✅ n8n analyze_symptom response received');
    } catch (err) {
      console.log('⚠️ n8n not responded (continuing with local data):', err.message);
    }
  }

  // ---- Respond to frontend ----
  res.json({
    success: true,
    n8n_notified: n8nNotified,
    n8n_response: n8nResponse,     // raw n8n AI output shown on frontend
    analysis: {
      risk_level: analysis.risk_level,
      possible_diseases: analysis.possible_diseases,
      first_aid_needed: analysis.first_aid_needed,
      seek_emergency: analysis.seek_emergency,
      total_matches: analysis.total_matches,
      analyzed_symptoms: hasSymptoms ? symptoms : [],
      raw_payload: n8nPayload  // shown in "View JSON" panel
    },
    timestamp
  });


  // ---- Background: save to Supabase (after responding to frontend) ----
  setImmediate(async () => {
    if (!userInfo.id) return;
    try {
      await supabase.from('symptom_checks').insert({
        user_id: userInfo.id,
        symptoms: hasSymptoms ? symptoms : [],
        risk_level: analysis.risk_level,
        possible_diseases: analysis.possible_diseases || [],
        recommendations: analysis.recommendations || [],
        first_aid_needed: analysis.first_aid_needed,
        n8n_sent: n8nNotified
      });
      console.log('✅ Saved to Supabase symptom_checks');
    } catch (e) {
      console.log('⚠️ DB save error:', e.message);
    }
  });
});


// GET /api/symptoms/history
router.get('/history', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('symptom_checks')
      .select('id, symptoms, risk_level, possible_diseases, recommendations, first_aid_needed, n8n_sent, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ history: data || [], total: data?.length || 0 });
  } catch (e) {
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// ---- Helpers ----
function buildDescription(symptoms, prompt) {
  const parts = [];
  if (symptoms?.length > 0) parts.push(`Symptoms: ${symptoms.join(', ')}.`);
  if (prompt?.trim()) parts.push(`Patient says: ${prompt.trim()}`);
  return parts.join(' ') || 'No description provided.';
}

module.exports = router;
