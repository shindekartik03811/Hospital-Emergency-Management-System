import React, { useState } from 'react';
import { 
  UserPlus, 
  AlertCircle, 
  Activity, 
  Heart, 
  Thermometer, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  X,
  Stethoscope,
  Info
} from 'lucide-react';
import { PatientRecord, PriorityLevel, Vitals } from '../types/patient';
import { PRIORITY_LABELS } from '../dataStructures/EmergencyQueue';
import { SIMULATION_PRESETS } from '../utils/samplePatients';

interface PatientRegistrationModalProps {
  onRegister: (patient: PatientRecord) => void;
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export const PatientRegistrationModal: React.FC<PatientRegistrationModalProps> = ({
  onRegister,
  onClose,
  isStandalonePage = false,
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(35);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [contactNumber, setContactNumber] = useState('+1 (555) 000-0000');
  const [emergencyContact, setEmergencyContact] = useState('Next of Kin (+1 555-111-2222)');
  const [allergies, setAllergies] = useState('No Known Drug Allergies (NKDA)');
  const [medicalHistory, setMedicalHistory] = useState('No significant past medical history');

  // Triage state
  const [isEmergency, setIsEmergency] = useState(true);
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('P2_EMERGENCY');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState('Dr. Michael Chen, MD (Emergency Medicine)');
  
  // Vitals
  const [bpSys, setBpSys] = useState<number>(124);
  const [bpDia, setBpDia] = useState<number>(82);
  const [heartRate, setHeartRate] = useState<number>(84);
  const [spo2, setSpo2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(98.6);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18);
  const [painScale, setPainScale] = useState<number>(5);

  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Pre-fill with a preset
  const handleApplyPreset = (index: number) => {
    const preset = SIMULATION_PRESETS[index];
    if (!preset) return;
    setFullName(preset.fullName);
    setAge(preset.age);
    setGender(preset.gender);
    setBloodGroup(preset.bloodGroup);
    setChiefComplaint(preset.chiefComplaint);
    setSymptoms(preset.symptoms);
    setPriorityLevel(preset.level);
    setIsEmergency(preset.category === 'Emergency');
    setBpSys(preset.vitals.bloodPressureSys);
    setBpDia(preset.vitals.bloodPressureDia);
    setHeartRate(preset.vitals.heartRate);
    setSpo2(preset.vitals.spo2);
    setTemperature(preset.vitals.temperature);
    setRespiratoryRate(preset.vitals.respiratoryRate);
    setPainScale(preset.vitals.painScale);
  };

  const handlePrioritySelect = (level: PriorityLevel) => {
    setPriorityLevel(level);
    // Auto sync isEmergency flag
    if (level === 'P1_CRITICAL' || level === 'P2_EMERGENCY' || level === 'P3_URGENT') {
      setIsEmergency(true);
    } else {
      setIsEmergency(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!fullName.trim()) errors.push('Patient full name is required');
    if (!age || age <= 0) errors.push('Valid age is required');
    if (!chiefComplaint.trim()) errors.push('Chief complaint is required');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const timestamp = Date.now();
    const patientId = `EMG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPatient: PatientRecord = {
      id: patientId,
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      bloodGroup,
      contactNumber: contactNumber.trim(),
      emergencyContact: emergencyContact.trim(),
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
      medicalHistory: medicalHistory.trim(),
      priorityLevel,
      isEmergency,
      chiefComplaint: chiefComplaint.trim(),
      symptoms: symptoms.trim(),
      vitals: {
        bloodPressureSys: bpSys,
        bloodPressureDia: bpDia,
        heartRate,
        spo2,
        temperature,
        respiratoryRate,
        painScale,
      },
      triageTimestamp: timestamp,
      triagedBy: 'Triage Desk Nurse, RN',
      status: 'Triaged / Waiting',
      assignedBayId: null,
      assignedDoctor,
      treatmentStartedAt: null,
      treatmentCompletedAt: null,
      clinicalNotes: '',
      medications: [],
      procedures: [],
      outcome: null,
      dischargeSummary: '',
      timeline: [
        {
          timestamp,
          action: 'Patient Registered & Triaged',
          note: `Assigned ${PRIORITY_LABELS[priorityLevel].code}. ${isEmergency ? 'Emergency preemption activated.' : 'Queued in FIFO order.'}`,
          actor: 'Triage Desk',
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    onRegister(newPatient);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${isStandalonePage ? 'p-6 max-w-4xl mx-auto' : 'p-6'}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold">
            <Stethoscope className="w-4 h-4" />
            <span>EMERGENCY DEPARTMENT ADMISSION</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Patient Triage & Registration
          </h2>
          <p className="text-xs text-slate-500">
            Emergency cases automatically jump to the front of the queue; normal cases follow FIFO order.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Fill Presets Bar */}
      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Fast Clinical Presets (Quick Fill)</span>
          </span>
          <span className="text-[11px] text-slate-400">Click to populate form instantly</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SIMULATION_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(idx)}
              className="text-xs px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-medium transition-colors"
            >
              {p.badge} ({p.fullName})
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-6">
        {formErrors.length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span>Please resolve the following fields:</span>
            </div>
            <ul className="list-disc list-inside">
              {formErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Priority Assignment Segment */}
        <div className="space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Priority & Triage Classification
              </h3>
              <p className="text-xs text-slate-500">
                Select clinical acuity level. Emergency levels preempt normal FIFO cases.
              </p>
            </div>

            {/* Emergency vs Normal Toggle */}
            <div className="inline-flex p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsEmergency(true);
                  if (priorityLevel === 'P4_LESS_URGENT' || priorityLevel === 'P5_NON_URGENT') {
                    setPriorityLevel('P2_EMERGENCY');
                  }
                }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  isEmergency ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Emergency (Priority Jump)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEmergency(false);
                  if (priorityLevel !== 'P4_LESS_URGENT' && priorityLevel !== 'P5_NON_URGENT') {
                    setPriorityLevel('P4_LESS_URGENT');
                  }
                }}
                className={`px-3 py-1 rounded-md transition-colors ${
                  !isEmergency ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Normal (FIFO Order)
              </button>
            </div>
          </div>

          {/* 5-Tier Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
            {(Object.keys(PRIORITY_LABELS) as PriorityLevel[]).map((level) => {
              const info = PRIORITY_LABELS[level];
              const isSelected = priorityLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handlePrioritySelect(level)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? `${info.bg} ${info.border} ring-2 ring-rose-500/30 font-semibold`
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className={`text-xs font-bold ${info.color}`}>
                    {info.code}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium mt-0.5 line-clamp-2">
                    {info.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient Demographics */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            2. Patient Identification & Demographics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                max="125"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none font-mono tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white font-mono"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Emergency Contact (Kin / Phone)
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Known Allergies
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Latex, Peanuts"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Clinical Presentation & Vitals */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            3. Clinical Presentation & Vital Signs
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Chief Complaint *
            </label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Acute chest pressure with diaphoresis, or Inverted ankle sprain"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Symptoms & Clinical Observations
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={2}
              placeholder="Detailed onset, radiation, severity, respiratory effort, skin condition..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none resize-none"
            />
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                BP (Sys/Dia)
              </label>
              <div className="flex items-center gap-1 font-mono tabular-nums">
                <input
                  type="number"
                  value={bpSys}
                  onChange={(e) => setBpSys(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-center"
                  placeholder="120"
                />
                <span className="text-slate-400">/</span>
                <input
                  type="number"
                  value={bpDia}
                  onChange={(e) => setBpDia(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-center"
                  placeholder="80"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Heart Rate (BPM)
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-center font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                SpO2 (%)
              </label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                min="50"
                max="100"
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-center font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Temp (°F)
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-center font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Resp. Rate
              </label>
              <input
                type="number"
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-center font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Pain (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={painScale}
                onChange={(e) => setPainScale(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded text-center font-mono tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Assigned Staff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Assigned Attending Physician
            </label>
            <select
              value={assignedDoctor}
              onChange={(e) => setAssignedDoctor(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white"
            >
              <option value="Dr. Michael Chen, MD (Emergency Medicine)">Dr. Michael Chen, MD (Emergency Medicine)</option>
              <option value="Dr. Sarah Al-Mansoor, MD (Trauma Surgery)">Dr. Sarah Al-Mansoor, MD (Trauma Surgery)</option>
              <option value="Dr. James Harrison, MD (Critical Care)">Dr. James Harrison, MD (Critical Care)</option>
              <option value="Dr. Lisa Bennett, MD (Emergency Physician)">Dr. Lisa Bennett, MD (Emergency Physician)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Past Medical History
            </label>
            <input
              type="text"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Complete Registration & Enqueue</span>
          </button>
        </div>
      </form>
    </div>
  );
};
