// aiService.js - AI Symptom Analysis & Risk Assessment
// Uses a rule-based engine with disease probabilities
// Can be extended to use Gemini API for advanced analysis

const axios = require('axios');
require('dotenv').config();

// ============================================================
// Symptom-Disease Knowledge Base
// Maps symptom combinations to potential diseases with risk levels
// ============================================================
const diseaseKnowledgeBase = {
  // Cardiovascular
  heart_attack: {
    symptoms: ['chest pain', 'chest tightness', 'left arm pain', 'shortness of breath', 'sweating', 'nausea', 'dizziness'],
    minMatch: 3,
    risk: 'critical',
    probability: 0.85,
    specialty: 'Cardiologist',
    firstAid: 'heart_attack'
  },
  hypertension: {
    symptoms: ['headache', 'dizziness', 'blurred vision', 'chest pain', 'shortness of breath'],
    minMatch: 2,
    risk: 'high',
    probability: 0.70,
    specialty: 'Cardiologist',
    firstAid: null
  },

  // Respiratory
  pneumonia: {
    symptoms: ['fever', 'cough', 'chest pain', 'shortness of breath', 'fatigue', 'chills', 'mucus'],
    minMatch: 3,
    risk: 'high',
    probability: 0.75,
    specialty: 'Pulmonologist',
    firstAid: null
  },
  asthma: {
    symptoms: ['wheezing', 'shortness of breath', 'chest tightness', 'cough', 'difficulty breathing'],
    minMatch: 2,
    risk: 'medium',
    probability: 0.72,
    specialty: 'Pulmonologist',
    firstAid: null
  },
  common_cold: {
    symptoms: ['runny nose', 'sneezing', 'sore throat', 'cough', 'mild fever', 'congestion'],
    minMatch: 3,
    risk: 'low',
    probability: 0.90,
    specialty: 'General Physician',
    firstAid: null
  },
  influenza: {
    symptoms: ['fever', 'chills', 'muscle aches', 'fatigue', 'headache', 'cough', 'sore throat'],
    minMatch: 4,
    risk: 'medium',
    probability: 0.80,
    specialty: 'General Physician',
    firstAid: null
  },

  // Neurological
  migraine: {
    symptoms: ['severe headache', 'nausea', 'vomiting', 'light sensitivity', 'blurred vision', 'throbbing pain'],
    minMatch: 2,
    risk: 'medium',
    probability: 0.82,
    specialty: 'Neurologist',
    firstAid: null
  },
  stroke: {
    symptoms: ['facial drooping', 'arm weakness', 'speech difficulty', 'sudden headache', 'confusion', 'vision loss', 'balance loss'],
    minMatch: 2,
    risk: 'critical',
    probability: 0.88,
    specialty: 'Neurologist',
    firstAid: 'stroke'
  },

  // Gastrointestinal
  food_poisoning: {
    symptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach cramps', 'fever', 'abdominal pain'],
    minMatch: 3,
    risk: 'medium',
    probability: 0.85,
    specialty: 'Gastroenterologist',
    firstAid: null
  },
  appendicitis: {
    symptoms: ['right lower abdominal pain', 'nausea', 'fever', 'loss of appetite', 'rebound tenderness'],
    minMatch: 2,
    risk: 'high',
    probability: 0.70,
    specialty: 'Gastroenterologist',
    firstAid: null
  },

  // Metabolic
  diabetes_symptoms: {
    symptoms: ['frequent urination', 'excessive thirst', 'fatigue', 'blurred vision', 'slow healing wounds', 'weight loss'],
    minMatch: 3,
    risk: 'medium',
    probability: 0.75,
    specialty: 'Endocrinologist',
    firstAid: null
  },

  // Skin
  dengue: {
    symptoms: ['high fever', 'severe headache', 'rash', 'muscle pain', 'joint pain', 'eye pain', 'fatigue'],
    minMatch: 3,
    risk: 'high',
    probability: 0.78,
    specialty: 'General Physician',
    firstAid: null
  },
  malaria: {
    symptoms: ['cyclical fever', 'chills', 'sweating', 'headache', 'nausea', 'vomiting', 'muscle pain'],
    minMatch: 3,
    risk: 'high',
    probability: 0.72,
    specialty: 'General Physician',
    firstAid: null
  }
};

// ============================================================
// Analyze symptoms and return risk assessment
// ============================================================
const analyzeSymptoms = async (symptoms) => {
  // Normalize symptoms to lowercase for matching
  const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

  const matchedDiseases = [];

  // Check each disease in the knowledge base
  for (const [disease, info] of Object.entries(diseaseKnowledgeBase)) {
    // Count how many of the user's symptoms match this disease
    const matchCount = info.symptoms.filter(s =>
      normalizedSymptoms.some(us => us.includes(s) || s.includes(us))
    ).length;

    // If enough symptoms match, add this disease to results
    if (matchCount >= info.minMatch) {
      // Adjust probability based on how many symptoms match
      const adjustedProbability = Math.min(
        info.probability * (matchCount / info.symptoms.length) * 2,
        0.95
      );

      matchedDiseases.push({
        disease: disease.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        probability: Math.round(adjustedProbability * 100),
        risk_level: info.risk,
        recommended_specialty: info.specialty,
        first_aid_guide: info.firstAid,
        matching_symptoms: info.symptoms.filter(s =>
          normalizedSymptoms.some(us => us.includes(s) || s.includes(us))
        )
      });
    }
  }

  // Sort by probability (highest first)
  matchedDiseases.sort((a, b) => b.probability - a.probability);

  // Determine overall risk level
  let overallRisk = 'low';
  if (matchedDiseases.some(d => d.risk_level === 'critical')) {
    overallRisk = 'critical';
  } else if (matchedDiseases.some(d => d.risk_level === 'high')) {
    overallRisk = 'high';
  } else if (matchedDiseases.some(d => d.risk_level === 'medium')) {
    overallRisk = 'medium';
  }

  // Generate recommendations based on risk level
  const recommendations = generateRecommendations(overallRisk, matchedDiseases);

  return {
    risk_level: overallRisk,
    possible_diseases: matchedDiseases.slice(0, 5), // Top 5 matches
    recommendations,
    first_aid_needed: overallRisk === 'critical' || overallRisk === 'high',
    seek_emergency: overallRisk === 'critical',
    analyzed_symptoms: normalizedSymptoms,
    total_matches: matchedDiseases.length
  };
};

// Generate personalized recommendations
const generateRecommendations = (riskLevel, diseases) => {
  const recommendations = [];

  if (riskLevel === 'critical') {
    recommendations.push('🚨 SEEK EMERGENCY CARE IMMEDIATELY - Call 112');
    recommendations.push('Do not drive yourself - call an ambulance');
    recommendations.push('Follow the first aid guide provided');
  } else if (riskLevel === 'high') {
    recommendations.push('⚠️ Visit a doctor or urgent care facility today');
    recommendations.push('Do not delay medical attention');
  } else if (riskLevel === 'medium') {
    recommendations.push('📅 Schedule a doctor appointment within 2-3 days');
    recommendations.push('Monitor symptoms for any worsening');
  } else {
    recommendations.push('💊 Rest and stay hydrated');
    recommendations.push('Over-the-counter medications may help');
    recommendations.push('See a doctor if symptoms persist beyond 3-5 days');
  }

  // Add specialty recommendations
  const specialties = [...new Set(diseases.slice(0, 3).map(d => d.recommended_specialty))];
  if (specialties.length > 0) {
    recommendations.push(`👨‍⚕️ Consider seeing a: ${specialties.join(', ')}`);
  }

  return recommendations;
};

module.exports = { analyzeSymptoms };
