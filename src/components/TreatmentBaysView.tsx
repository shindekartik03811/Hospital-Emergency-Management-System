import React, { useState } from 'react';
import { 
  Bed, 
  Activity, 
  Clock, 
  Pill, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Heart, 
  Thermometer, 
  User, 
  Plus, 
  Sparkles,
  BedDouble,
  LogOut,
  Stethoscope
} from 'lucide-react';
import { PatientRecord, TreatmentBay, PriorityLevel } from '../types/patient';
import { PRIORITY_LABELS } from '../dataStructures/EmergencyQueue';

interface TreatmentBaysViewProps {
  bays: TreatmentBay[];
  patientsMap: Map<string, PatientRecord>;
  nextQueuePatient: PatientRecord | null;
  onAdmitPatient: (patientId: string, bayId: string) => void;
  onOpenCompleteModal: (patient: PatientRecord) => void;
  onAddMedication: (patientId: string, medName: string, dose: string, route: string) => void;
  onAddNote: (patientId: string, note: string) => void;
  onViewPatient: (patient: PatientRecord) => void;
}

export const TreatmentBaysView: React.FC<TreatmentBaysViewProps> = ({
  bays,
  patientsMap,
  nextQueuePatient,
  onAdmitPatient,
  onOpenCompleteModal,
  onAddMedication,
  onAddNote,
  onViewPatient,
}) => {
  // Modal / popover state for adding medication
  const [activeMedBayId, setActiveMedBayId] = useState<string | null>(null);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medRoute, setMedRoute] = useState('IV');

  // Note popover state
  const [activeNoteBayId, setActiveNoteBayId] = useState<string | null>(null);
  const [quickNote, setQuickNote] = useState('');

  const occupiedCount = bays.filter(b => b.isOccupied).length;
  const availableCount = bays.length - occupiedCount;

  const handleMedSubmit = (patientId: string) => {
    if (!medName.trim() || !medDose.trim()) return;
    onAddMedication(patientId, medName.trim(), medDose.trim(), medRoute);
    setMedName('');
    setMedDose('');
    setActiveMedBayId(null);
  };

  const handleNoteSubmit = (patientId: string) => {
    if (!quickNote.trim()) return;
    onAddNote(patientId, quickNote.trim());
    setQuickNote('');
    setActiveNoteBayId(null);
  };

  const formatDuration = (startedAt: number | null) => {
    if (!startedAt) return 'Just admitted';
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - startedAt) / 60000));
    return `${elapsedMinutes}m in treatment`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold">
              <Bed className="w-4 h-4" />
              <span>EMERGENCY CLINICAL CARE SUITES</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Active Treatment Bays & Trauma Rooms
            </h1>
            <p className="text-xs text-slate-500">
              Real-time monitoring of patients undergoing active resuscitation, emergency procedures, and observation.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-semibold tabular-nums">
              Occupied: {occupiedCount} / {bays.length}
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold tabular-nums">
              Available: {availableCount}
            </div>
          </div>
        </div>
      </div>

      {/* Bays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bays.map((bay) => {
          const patient = bay.currentPatientId ? patientsMap.get(bay.currentPatientId) : null;
          const priorityInfo = patient ? PRIORITY_LABELS[patient.priorityLevel] : null;

          return (
            <div
              key={bay.id}
              className={`rounded-xl border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                bay.isOccupied
                  ? 'bg-white border-slate-300'
                  : 'bg-slate-50/70 border-dashed border-slate-300'
              }`}
            >
              {/* Bay Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {bay.type}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{bay.name}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {bay.ventilatorAvailable && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono font-medium">
                        Ventilator
                      </span>
                    )}
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      bay.isOccupied ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {bay.isOccupied ? 'Occupied' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bay Body */}
              <div className="p-4 flex-1">
                {bay.isOccupied && patient && priorityInfo ? (
                  <div className="space-y-3.5">
                    {/* Patient identity & triage code */}
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${priorityInfo.bg} ${priorityInfo.color} ${priorityInfo.border}`}>
                          {priorityInfo.code}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(patient.treatmentStartedAt)}</span>
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {patient.fullName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {patient.age}y · {patient.gender} · Blood {patient.bloodGroup} · ID: {patient.id}
                      </p>
                    </div>

                    {/* Vitals summary */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Telemetry Vitals
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 font-mono text-center tabular-nums">
                        <div className="p-1 bg-white rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">BP</span>
                          <span className="font-semibold text-slate-800 text-[11px]">{patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia}</span>
                        </div>
                        <div className="p-1 bg-white rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">HR</span>
                          <span className="font-semibold text-slate-800 text-[11px]">{patient.vitals.heartRate}</span>
                        </div>
                        <div className="p-1 bg-white rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">SpO2</span>
                          <span className="font-semibold text-slate-800 text-[11px]">{patient.vitals.spo2}%</span>
                        </div>
                        <div className="p-1 bg-white rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Temp</span>
                          <span className="font-semibold text-slate-800 text-[11px]">{patient.vitals.temperature}°</span>
                        </div>
                      </div>
                    </div>

                    {/* Chief complaint & notes */}
                    <div className="text-xs text-slate-700 space-y-1">
                      <p className="line-clamp-2">
                        <span className="font-semibold text-slate-900">Complaint:</span> {patient.chiefComplaint}
                      </p>
                      {patient.clinicalNotes && (
                        <p className="text-slate-600 line-clamp-2 italic bg-amber-50/60 p-1.5 rounded border border-amber-200/60 text-[11px]">
                          "{patient.clinicalNotes}"
                        </p>
                      )}
                    </div>

                    {/* Administered meds summary */}
                    {patient.medications.length > 0 && (
                      <div className="text-[11px] space-y-1">
                        <div className="font-semibold text-slate-600 flex items-center gap-1">
                          <Pill className="w-3 h-3 text-rose-500" />
                          <span>Medications Given ({patient.medications.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {patient.medications.map((m) => (
                            <span key={m.id} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px]">
                              {m.name} ({m.dose})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Add Med / Note inline forms */}
                    {activeMedBayId === bay.id && (
                      <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg space-y-2 text-xs">
                        <div className="font-semibold text-rose-800 flex items-center justify-between">
                          <span>Administer Medication</span>
                          <button onClick={() => setActiveMedBayId(null)} className="text-rose-500 hover:text-rose-700">×</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Medication name (e.g. Epinephrine)"
                            value={medName}
                            onChange={(e) => setMedName(e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs col-span-2"
                          />
                          <input
                            type="text"
                            placeholder="Dose (e.g. 1 mg)"
                            value={medDose}
                            onChange={(e) => setMedDose(e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                          <select
                            value={medRoute}
                            onChange={(e) => setMedRoute(e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          >
                            <option value="IV">IV Push</option>
                            <option value="IV Infusion">IV Infusion</option>
                            <option value="Oral">Oral</option>
                            <option value="SL">Sublingual</option>
                            <option value="IM">IM</option>
                            <option value="Nebulized">Nebulized</option>
                          </select>
                        </div>
                        <button
                          onClick={() => handleMedSubmit(patient.id)}
                          className="w-full py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                        >
                          Record Administration
                        </button>
                      </div>
                    )}

                    {activeNoteBayId === bay.id && (
                      <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg space-y-2 text-xs">
                        <div className="font-semibold text-slate-800 flex items-center justify-between">
                          <span>Add Physician Note</span>
                          <button onClick={() => setActiveNoteBayId(null)} className="text-slate-500 hover:text-slate-700">×</button>
                        </div>
                        <textarea
                          placeholder="Clinical observation, ultrasound findings, stabilization status..."
                          value={quickNote}
                          onChange={(e) => setQuickNote(e.target.value)}
                          rows={2}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs resize-none"
                        />
                        <button
                          onClick={() => handleNoteSubmit(patient.id)}
                          className="w-full py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                        >
                          Save Clinical Note
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Bed className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-slate-700">
                        Bay Ready & Sanitized
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        No patient currently assigned to this bay.
                      </p>
                    </div>

                    {nextQueuePatient ? (
                      <button
                        onClick={() => onAdmitPatient(nextQueuePatient.id, bay.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors"
                      >
                        <BedDouble className="w-3.5 h-3.5 text-rose-600" />
                        <span>Admit {nextQueuePatient.fullName.split(' ')[0]}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Waiting for queue arrival
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bay Footer Action Bar */}
              {bay.isOccupied && patient && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveMedBayId(activeMedBayId === bay.id ? null : bay.id)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                    >
                      + Med
                    </button>
                    <button
                      onClick={() => setActiveNoteBayId(activeNoteBayId === bay.id ? null : bay.id)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                    >
                      + Note
                    </button>
                    <button
                      onClick={() => onViewPatient(patient)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                    >
                      Chart
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenCompleteModal(patient)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-2xs transition-colors whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Treatment</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
