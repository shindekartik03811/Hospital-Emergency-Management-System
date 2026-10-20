export type PriorityLevel = 
  | 'P1_CRITICAL'    // Code Red - Resuscitation: Immediate life threat (Cardiac arrest, Severe trauma, Airway compromise)
  | 'P2_EMERGENCY'   // Code Orange - Emergent: High risk, severe chest pain, severe bleed, stroke signs
  | 'P3_URGENT'      // Code Yellow - Urgent: Needs prompt attention, severe pain, moderate respiratory distress
  | 'P4_LESS_URGENT' // Code Green - Normal FIFO: Stable, fracture, sprain, moderate laceration
  | 'P5_NON_URGENT'; // Code Blue - Normal FIFO: Mild symptoms, sutures, prescription refill, rash

export type PatientStatus = 
  | 'Triaged / Waiting' 
  | 'In Treatment' 
  | 'Treatment Completed' 
  | 'Admitted to ICU' 
  | 'Admitted to Ward' 
  | 'Discharged Home'
  | 'Transferred';

export interface Vitals {
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRate: number;      // bpm
  spo2: number;           // %
  temperature: number;    // °F
  respiratoryRate: number;// breaths/min
  painScale: number;      // 0-10
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  route: string; // IV, Oral, IM, Inhalation
  timestamp: number;
  administeredBy: string;
}

export interface PatientTimelineEvent {
  timestamp: number;
  action: string;
  note: string;
  actor: string;
}

export interface PatientRecord {
  id: string; // e.g. "EMG-1042"
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  contactNumber: string;
  emergencyContact: string;
  allergies: string[];
  medicalHistory: string;

  // Triage details
  priorityLevel: PriorityLevel;
  isEmergency: boolean; // true = Emergency priority jump (P1-P3), false = Normal FIFO (P4-P5)
  chiefComplaint: string;
  symptoms: string;
  vitals: Vitals;
  triageTimestamp: number;
  triagedBy: string;

  // Current ER State
  status: PatientStatus;
  assignedBayId: string | null;
  assignedDoctor: string;

  // Treatment lifecycle
  treatmentStartedAt: number | null;
  treatmentCompletedAt: number | null;
  clinicalNotes: string;
  medications: Medication[];
  procedures: string[];
  outcome: 'Discharged Home' | 'Admitted to ICU' | 'Admitted to Ward' | 'Transferred' | null;
  dischargeSummary: string;

  // Audit trail
  timeline: PatientTimelineEvent[];
  createdAt: number;
  updatedAt: number;
}

export interface TreatmentBay {
  id: string;
  name: string;
  type: 'Resuscitation Bay' | 'Trauma Suite' | 'Cardiac Care' | 'Acute Medical' | 'Fast Track Bed' | 'Observation Bed';
  isOccupied: boolean;
  currentPatientId: string | null;
  ventilatorAvailable: boolean;
  monitorsOnline: boolean;
}

export interface QueueNodeView {
  patient: PatientRecord;
  queuePosition: number;
  estimatedWaitMinutes: number;
  isEmergencyPreempt: boolean;
}
