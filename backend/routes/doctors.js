// doctors.js Route - Find specialists using Supabase JS client
const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

const fallbackDoctors = [
  { id: '1', name: 'Dr. Priya Sharma', specialty: 'Cardiologist', qualification: 'MBBS, MD, DM Cardiology', hospital: 'Apollo Hospital', city: 'Chennai', phone: '+91-9876543210', rating: 4.8, experience_years: 15, consultation_fee: 800, available_days: ['Mon', 'Tue', 'Wed', 'Fri'] },
  { id: '2', name: 'Dr. Rajesh Kumar', specialty: 'Neurologist', qualification: 'MBBS, MD, DM Neurology', hospital: 'AIIMS Delhi', city: 'New Delhi', phone: '+91-9876543211', rating: 4.9, experience_years: 20, consultation_fee: 1000, available_days: ['Mon', 'Wed', 'Thu', 'Sat'] },
  { id: '3', name: 'Dr. Anita Patel', specialty: 'General Physician', qualification: 'MBBS, MD', hospital: 'City Hospital', city: 'Mumbai', phone: '+91-9876543212', rating: 4.6, experience_years: 10, consultation_fee: 500, available_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  { id: '4', name: 'Dr. Suresh Reddy', specialty: 'Pulmonologist', qualification: 'MBBS, MD, DNB', hospital: 'Yashoda Hospital', city: 'Hyderabad', phone: '+91-9876543213', rating: 4.7, experience_years: 12, consultation_fee: 700, available_days: ['Tue', 'Thu', 'Fri', 'Sat'] },
  { id: '5', name: 'Dr. Meera Nair', specialty: 'Dermatologist', qualification: 'MBBS, MD Dermatology', hospital: 'Fortis Hospital', city: 'Bangalore', phone: '+91-9876543214', rating: 4.5, experience_years: 8, consultation_fee: 600, available_days: ['Mon', 'Wed', 'Fri'] },
  { id: '6', name: 'Dr. Vikram Singh', specialty: 'Orthopedic Surgeon', qualification: 'MBBS, MS Orthopedics', hospital: 'Max Hospital', city: 'New Delhi', phone: '+91-9876543215', rating: 4.8, experience_years: 18, consultation_fee: 900, available_days: ['Mon', 'Tue', 'Thu', 'Sat'] }
];

// GET /api/doctors?specialty=Cardiologist&city=Mumbai
router.get('/', async (req, res) => {
  const { specialty, city } = req.query;
  try {
    let query = supabase.from('doctors').select('*').order('rating', { ascending: false });
    if (specialty) query = query.ilike('specialty', `%${specialty}%`);
    if (city) query = query.ilike('city', `%${city}%`);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ doctors: data?.length > 0 ? data : fallbackDoctors, total: (data || fallbackDoctors).length });
  } catch {
    res.json({ doctors: fallbackDoctors, total: fallbackDoctors.length });
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('doctors').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor: data });
  } catch {
    res.status(500).json({ message: 'Error fetching doctor profile' });
  }
});

module.exports = router;
