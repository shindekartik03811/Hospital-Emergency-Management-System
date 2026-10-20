import React from 'react';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Clock 
} from 'lucide-react';
import { SIMULATION_PRESETS } from '../utils/samplePatients';
import { PatientRecord, PriorityLevel } from '../types/patient';
import { PRIORITY_LABELS } from '../dataStructures/EmergencyQueue';

interface SimulationModalProps {
  onSimulatePatient: (patient: PatientRecord) => void;
  onClose: () => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  onSimulatePatient,
  onClose,
}) => {
  const handleSelectPreset = (index: number) => {
    const preset = SIMULATION_PRESETS[index];
    const timestamp = Date.now();
    const id = `EMG-${Math.floor(2000 + Math.random() * 8000)}`;

    const isEmergency = preset.category === 'Emergency';

    const patient: PatientRecord = {
      id,
      fullName: preset.fullName,
      age: preset.age,
      gender: preset.gender,
      bloodGroup: preset.bloodGroup,
      contactNumber: '+1 (555) 555-0199',
      emergencyContact: 'Family Member (+1 555-555-0188)',
      allergies: ['None reported'],
      medicalHistory: 'Non-smoker',
      priorityLevel: preset.level,
      isEmergency,
      chiefComplaint: preset.chiefComplaint,
      symptoms: preset.symptoms,
      vitals: { ...preset.vitals },
      triageTimestamp: timestamp,
      triagedBy: 'ER Triage Desk Nurse',
      status: 'Triaged / Waiting',
      assignedBayId: null,
      assignedDoctor: 'Dr. Michael Chen, MD',
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
          action: 'Emergency Simulated Arrival',
          note: `Case simulated: ${preset.title}. Assigned ${PRIORITY_LABELS[preset.level].code}.`,
          actor: 'Simulation Engine',
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    onSimulatePatient(patient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <Sparkles className="w-4 h-4" />
              <span>TEST SCENARIO GENERATOR</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Simulate Clinical ER Arrival
            </h3>
            <p className="text-xs text-slate-500">
              Select an archetype to test priority preemption vs normal FIFO queue placement.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {SIMULATION_PRESETS.map((preset, idx) => {
            const isEmergency = preset.category === 'Emergency';
            const priorityInfo = PRIORITY_LABELS[preset.level];

            return (
              <button
                key={idx}
                onClick={() => handleSelectPreset(idx)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityInfo.bg} ${priorityInfo.color} ${priorityInfo.border}`}>
                      {priorityInfo.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      {preset.fullName} ({preset.age}y)
                    </span>
                    <span className="text-[11px] text-slate-400">·</span>
                    <span className={`text-[11px] font-semibold ${isEmergency ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {isEmergency ? 'Priority Jump' : 'FIFO Order'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {preset.chiefComplaint}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 tabular-nums">
                    <span>BP: {preset.vitals.bloodPressureSys}/{preset.vitals.bloodPressureDia}</span>
                    <span>HR: {preset.vitals.heartRate} bpm</span>
                    <span>SpO2: {preset.vitals.spo2}%</span>
                    <span>Pain: {preset.vitals.painScale}/10</span>
                  </div>
                </div>

                <div className="self-center p-2 rounded-lg bg-white border border-slate-200 text-slate-400 group-hover:text-rose-600 group-hover:border-rose-300 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-400">
            Emergency cases automatically place ahead of existing Normal FIFO cases in the queue.
          </p>
        </div>
      </div>
    </div>
  );
};
