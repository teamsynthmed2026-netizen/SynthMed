// firstaid.js Route - First aid guides using Supabase JS client
const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

// Fallback guides in case table doesn't exist (first_aid_guides was removed from schema)
const fallbackGuides = [
  { id: '1', condition: 'heart_attack', title: 'Heart Attack', description: 'Call 112 immediately and give aspirin if available.', severity: 'life_threatening', icon: '❤️',
    steps: [
      { step_number: 1, instruction: 'Call emergency services (112) immediately', tip: 'Do not delay calling' },
      { step_number: 2, instruction: 'Help them sit comfortably, loosen tight clothing', tip: 'Keep them calm' },
      { step_number: 3, instruction: 'Give aspirin if available and not allergic', tip: '325mg crushed or chewed' },
      { step_number: 4, instruction: 'Begin CPR if person is unconscious and not breathing', tip: '30 compressions, 2 breaths' }
    ], do_nots: ['Do not leave them alone', 'Do not let them walk', 'Do not give food or water'], when_to_call_911: 'Immediately' },
  { id: '2', condition: 'choking', title: 'Choking', description: 'Perform Heimlich maneuver if person cannot breathe.', severity: 'life_threatening', icon: '🫁',
    steps: [
      { step_number: 1, instruction: 'Ask: Can you speak? If yes, encourage coughing', tip: 'Do not interfere if coughing forcefully' },
      { step_number: 2, instruction: 'Give 5 firm back blows with heel of hand', tip: 'Between shoulder blades' },
      { step_number: 3, instruction: 'Give 5 abdominal thrusts (Heimlich maneuver)', tip: 'Fist above navel, thrust inward and upward' }
    ], do_nots: ['Do not do blind finger sweeps'], when_to_call_911: 'If not resolved in 1-2 min' },
  { id: '3', condition: 'stroke', title: 'Stroke', description: 'Use F.A.S.T. - Face, Arms, Speech, Time. Call 112.', severity: 'life_threatening', icon: '🧠',
    steps: [
      { step_number: 1, instruction: 'Use FAST: Face drooping, Arm weakness, Speech difficulty, Time', tip: 'Even one sign = stroke' },
      { step_number: 2, instruction: 'Call 112 immediately, note time symptoms started', tip: 'Time is brain cells' },
      { step_number: 3, instruction: 'Do NOT give food, water, or aspirin', tip: 'Swallowing may be impaired' }
    ], do_nots: ['Do not give aspirin', 'Do not let them sleep it off'], when_to_call_911: 'Immediately' },
  { id: '4', condition: 'burn', title: 'Burns', description: 'Cool with running water for 20 minutes. No ice.', severity: 'moderate', icon: '🔥',
    steps: [
      { step_number: 1, instruction: 'Remove from burn source safely', tip: 'Ensure your own safety first' },
      { step_number: 2, instruction: 'Cool with cool (not cold) running water for 20 minutes', tip: 'Never use ice or butter' },
      { step_number: 3, instruction: 'Cover loosely with non-stick sterile bandage', tip: 'Do not wrap tightly' }
    ], do_nots: ['Do not use ice', 'Do not break blisters', 'Do not apply butter or toothpaste'], when_to_call_911: 'Large/chemical/facial burns' },
  { id: '5', condition: 'fracture', title: 'Bone Fracture', description: 'Immobilize the injured limb. Do not try to straighten it.', severity: 'moderate', icon: '🦴',
    steps: [
      { step_number: 1, instruction: 'Keep injured area still, do not straighten', tip: 'If bone visible, cover with clean cloth' },
      { step_number: 2, instruction: 'Apply ice pack wrapped in cloth', tip: '20 min on, 20 min off' },
      { step_number: 3, instruction: 'Seek medical help', tip: 'Do not put weight on injured area' }
    ], do_nots: ['Do not straighten limb', 'Do not move if spinal injury suspected'], when_to_call_911: 'Open fractures or spinal injury' },
  { id: '6', condition: 'allergic_reaction', title: 'Severe Allergy', description: 'Use EpiPen immediately and call 112 for anaphylaxis.', severity: 'life_threatening', icon: '⚠️',
    steps: [
      { step_number: 1, instruction: 'Remove allergen if possible', tip: 'Common: food, bee stings, medication' },
      { step_number: 2, instruction: 'Use EpiPen if available — inject outer thigh', tip: 'Even through clothing' },
      { step_number: 3, instruction: 'Call 112 immediately', tip: 'Even if EpiPen was used' }
    ], do_nots: ['Do not make person walk', 'Do not assume symptoms will improve'], when_to_call_911: 'Any throat swelling or breathing difficulty' }
];

// GET /api/firstaid — list all guides
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('first_aid_guides').select('id, condition, title, description, severity, icon').order('severity');
    if (error || !data?.length) return res.json({ guides: fallbackGuides, total: fallbackGuides.length });
    res.json({ guides: data, total: data.length });
  } catch {
    res.json({ guides: fallbackGuides, total: fallbackGuides.length });
  }
});

// GET /api/firstaid/:condition — get full detail
router.get('/:condition', async (req, res) => {
  // Check fallback first (table may not exist)
  const fallback = fallbackGuides.find(g => g.condition === req.params.condition);
  try {
    const { data, error } = await supabase.from('first_aid_guides').select('*').eq('condition', req.params.condition).single();
    if (error || !data) {
      if (fallback) return res.json({ guide: fallback });
      return res.status(404).json({ message: 'Guide not found' });
    }
    res.json({ guide: data });
  } catch {
    if (fallback) return res.json({ guide: fallback });
    res.status(500).json({ message: 'Error fetching guide' });
  }
});

module.exports = router;
