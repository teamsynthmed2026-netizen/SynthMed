// appointments.js - Book appointments + send to n8n webhook
const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const { protect } = require('../middleware/auth');
const axios = require('axios');
require('dotenv').config();

const timeSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

// ============================================================
// POST /api/appointments — Book appointment + trigger n8n
// ============================================================
router.post('/', protect, async (req, res) => {
  const { doctor_id, appointment_date, appointment_time, reason, notes } = req.body;

  if (!doctor_id || !appointment_date || !appointment_time)
    return res.status(400).json({ message: 'Doctor ID, date, and time are required' });

  try {
    // Fetch doctor details
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id, name, specialty, hospital, city, phone, consultation_fee')
      .eq('id', doctor_id).single();

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Check for duplicate slot
    const { data: existing } = await supabase.from('appointments')
      .select('id')
      .eq('doctor_id', doctor_id)
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .neq('status', 'cancelled')
      .single();

    if (existing) return res.status(400).json({ message: 'This time slot is already booked. Please choose another.' });

    // Create the appointment
    const { data: appointment, error } = await supabase.from('appointments')
      .insert({
        user_id: req.user.id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason: reason || null,
        notes: notes || null,
        status: 'pending',
        n8n_sent: false
      })
      .select().single();

    if (error) throw error;

    // Build n8n webhook payload — 'action' string routes via Switch node to Appointment Agent
    const webhookPayload = {
      action: 'appointment',       // ← Switch routes on this → Appointment Agent
      appointment: {
        id: appointment.id,
        date: appointment_date,
        time: appointment_time,
        status: 'pending',
        reason: reason || 'Not specified',
        notes: notes || 'None'
      },
      patient: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      doctor: {
        name: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital || 'Private Practice',
        city: doctor.city,
        phone: doctor.phone,
        consultation_fee: `₹${doctor.consultation_fee}`
      }
    };


    // Fire n8n webhook (don't wait — respond to user immediately)
    let n8nSent = false;
    if (process.env.N8N_WEBHOOK_URL) {
      axios.post(process.env.N8N_WEBHOOK_URL, webhookPayload, {
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' }
      }).then(async () => {
        console.log('✅ n8n appointment webhook triggered');
        // Update n8n_sent flag in DB
        await supabase.from('appointments').update({ n8n_sent: true }).eq('id', appointment.id);
      }).catch(err => console.log('⚠️ n8n webhook failed:', err.message));
      n8nSent = true;
    }

    res.status(201).json({
      message: `✅ Appointment confirmed with ${doctor.name}!`,
      n8n_notified: n8nSent,
      webhook_payload: webhookPayload, // expose to frontend for display
      appointment: {
        ...appointment,
        doctor_name: doctor.name,
        doctor_specialty: doctor.specialty,
        hospital: doctor.hospital,
        city: doctor.city
      }
    });

  } catch (error) {
    console.error('Appointment error:', error.message);
    res.status(500).json({ message: 'Error booking appointment. Please try again.' });
  }
});

// GET /api/appointments/my
router.get('/my', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, doctors(name, specialty, hospital, phone, city)')
      .eq('user_id', req.user.id)
      .order('appointment_date', { ascending: false });

    if (error) throw error;
    const appointments = (data || []).map(a => ({
      ...a,
      doctor_name: a.doctors?.name,
      doctor_specialty: a.doctors?.specialty,
      hospital: a.doctors?.hospital,
      doctor_phone: a.doctors?.phone,
      city: a.doctors?.city,
    }));
    res.json({ appointments, total: appointments.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// PUT /api/appointments/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select().single();

    if (error || !data) return res.status(404).json({ message: 'Appointment not found or not authorized' });
    res.json({ message: 'Appointment cancelled', appointment: data });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
});

module.exports = router;
