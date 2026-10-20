import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  Activity, 
  CheckCircle2, 
  Heart, 
  Thermometer, 
  ShieldAlert, 
  ArrowDownUp, 
  Sparkles,
  UserPlus,
  BedDouble,
  ChevronDown,
  Info
} from 'lucide-react';
import { PatientRecord, PriorityLevel, TreatmentBay } from '../types/patient';
import { PRIORITY_LABELS } from '../dataStructures/EmergencyQueue';

interface QueueManagerProps {
  queue: PatientRecord[];
  bays: TreatmentBay[];
  onAdmitPatient: (patientId: string, bayId: string) => void;
  onUpdatePriority: (patientId: string, newLevel: PriorityLevel) => void;
  onViewPatient: (patient: PatientRecord) => void;
  onOpenRegister: () => void;
  onOpenSimulation: () => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  queue,
  bays,
  onAdmitPatient,
  onUpdatePriority,
  onViewPatient,
  onOpenRegister,
  onOpenSimulation,
}) => {
  const [selectedBayByPatient, setSelectedBayByPatient] = useState<Record<string, string>>({});
  const [openEscalateId, setOpenEscalateId] = useState<string | null>(null);

  const availableBays = bays.filter(b => !b.isOccupied);
  const emergencyCount = queue.filter(p => p.isEmergency || p.priorityLevel === 'P1_CRITICAL' || p.priorityLevel === 'P2_EMERGENCY' || p.priorityLevel === 'P3_URGENT').length;
  const normalFifoCount = queue.length - emergencyCount;

  // Format waiting duration
  const formatWaitTime = (timestamp: number) => {
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes}m waiting`;
    }
    const hrs = Math.floor(elapsedMinutes / 60);
    const mins = elapsedMinutes % 60;
    return `${hrs}h ${mins}m waiting`;
  };

  const handleBaySelect = (patientId: string, bayId: string) => {
    setSelectedBayByPatient(prev => ({ ...prev, [patientId]: bayId }));
  };

  const handleAdmitClick = (patient: PatientRecord) => {
    const chosenBayId = selectedBayByPatient[patient.id] || (availableBays.length > 0 ? availableBays[0].id : '');
    if (!chosenBayId) {
      alert('All treatment bays are currently occupied. Complete treatment on an active bay or wait for discharge.');
      return;
    }
    onAdmitPatient(patient.id, chosenBayId);
  };

  return (
    <div className="space-y-6">
      {/* Top Protocol Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-medium text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>TRIAGE QUEUE PROTOCOL ENGINE</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">Emergency Precedence & FIFO Enforcement</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Emergency Priority Queue
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Emergency cases (Code Red, Orange, Yellow) automatically jump ahead of normal cases based on clinical severity. Normal cases (Code Green, Blue) strictly follow First-In, First-Out (FIFO) arrival order.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Patient</span>
            </button>
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
            <div className="text-slate-400 text-xs font-medium">Total Waiting</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
              {queue.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active in ER queue</div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-3 border border-rose-900/40">
            <div className="text-rose-400 text-xs font-medium flex items-center gap-1">
              <span>Emergency Cases</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-300 mt-0.5">
              {emergencyCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Preempting queue</div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-3 border border-emerald-900/40">
            <div className="text-emerald-400 text-xs font-medium">Normal Cases</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-300 mt-0.5">
              {normalFifoCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">FIFO order enforced</div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
            <div className="text-slate-400 text-xs font-medium">Available Bays</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-sky-400 mt-0.5">
              {availableBays.length} <span className="text-sm font-normal text-slate-400">/ {bays.length}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ready for admission</div>
          </div>
        </div>
      </div>

      {/* Next Patient Callout Card if Queue is not empty */}
      {queue.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 via-white to-slate-50 border border-rose-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>NEXT UP FOR IMMEDIATE ADMISSION</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-slate-600">{queue[0].id}</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">
                {queue[0].fullName} ({queue[0].age}y, {queue[0].gender}, {queue[0].bloodGroup})
              </h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${PRIORITY_LABELS[queue[0].priorityLevel].bg} ${PRIORITY_LABELS[queue[0].priorityLevel].color} ${PRIORITY_LABELS[queue[0].priorityLevel].border}`}>
                {PRIORITY_LABELS[queue[0].priorityLevel].code}
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-1">
              <span className="font-semibold text-slate-700">Complaint:</span> {queue[0].chiefComplaint}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedBayByPatient[queue[0].id] || (availableBays.length > 0 ? availableBays[0].id : '')}
              onChange={(e) => handleBaySelect(queue[0].id, e.target.value)}
              disabled={availableBays.length === 0}
              className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
            >
              {availableBays.length === 0 ? (
                <option value="">No Bays Available</option>
              ) : (
                availableBays.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.type})
                  </option>
                ))
              )}
            </select>

            <button
              onClick={() => handleAdmitClick(queue[0])}
              disabled={availableBays.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <BedDouble className="w-4 h-4" />
              <span>Call & Admit Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 uppercase tracking-wider">Queue Order</span>
            <span>·</span>
            <span>Sorted by Clinical Preemption & FIFO Arrival</span>
          </div>
          <span>Showing {queue.length} Patients Waiting</span>
        </div>

        {queue.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900">
                ER Queue Is Currently Clear
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No patients are currently awaiting treatment in the queue. Register a new patient or run a simulation.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenSimulation}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Simulate Scenario
              </button>
              <button
                onClick={onOpenRegister}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
              >
                Register Walk-in / Ambulance
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((patient, index) => {
              const priorityInfo = PRIORITY_LABELS[patient.priorityLevel];
              const isFirst = index === 0;
              const isEmergencyCase = patient.isEmergency || patient.priorityLevel === 'P1_CRITICAL' || patient.priorityLevel === 'P2_EMERGENCY' || patient.priorityLevel === 'P3_URGENT';
              const arrivalTime = new Date(patient.triageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={patient.id}
                  className={`bg-white rounded-xl border transition-all duration-200 p-4 sm:p-5 shadow-sm hover:border-slate-300 ${
                    isFirst ? 'border-rose-400 ring-1 ring-rose-300/40 bg-rose-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left details */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Queue Rank Badge */}
                      <div className={`w-10 h-10 rounded-lg shrink-0 flex flex-col items-center justify-center font-mono font-bold text-sm ${
                        isFirst
                          ? 'bg-rose-600 text-white shadow-sm'
                          : isEmergencyCase
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <span className="text-[10px] leading-none uppercase font-sans font-medium text-slate-400">No.</span>
                        <span className="tabular-nums leading-none mt-0.5">#{index + 1}</span>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Status kicker and metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${priorityInfo.bg} ${priorityInfo.color} ${priorityInfo.border}`}>
                            {priorityInfo.code}
                          </span>

                          {isEmergencyCase ? (
                            <span className="text-rose-700 font-semibold text-xs flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Emergency Priority Preemption</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Normal FIFO Queue Position</span>
                            </span>
                          )}

                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-slate-500">{patient.id}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Arrived {arrivalTime} ({formatWaitTime(patient.triageTimestamp)})</span>
                          </span>
                        </div>

                        {/* Patient Name and Chief Complaint */}
                        <div>
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>{patient.fullName}</span>
                            <span className="text-xs font-normal text-slate-500">
                              ({patient.age}y · {patient.gender} · Blood {patient.bloodGroup})
                            </span>
                          </h3>
                          <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                            <span className="font-semibold text-slate-900">Chief Complaint:</span> {patient.chiefComplaint}
                          </p>
                          {patient.symptoms && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              <span className="font-medium text-slate-600">Symptoms:</span> {patient.symptoms}
                            </p>
                          )}
                        </div>

                        {/* Vitals Ribbon */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-mono text-slate-700 tabular-nums">
                            <Activity className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-500 text-[11px]">BP:</span>
                            <span className="font-semibold">{patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia}</span>
                          </div>

                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-mono text-slate-700 tabular-nums">
                            <Heart className={`w-3.5 h-3.5 ${patient.vitals.heartRate > 100 || patient.vitals.heartRate < 60 ? 'text-rose-500' : 'text-slate-400'}`} />
                            <span className="text-slate-500 text-[11px]">HR:</span>
                            <span className="font-semibold">{patient.vitals.heartRate} bpm</span>
                          </div>

                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-mono text-slate-700 tabular-nums">
                            <span className={`text-[11px] font-semibold ${patient.vitals.spo2 < 95 ? 'text-rose-600' : 'text-slate-500'}`}>SpO2:</span>
                            <span className="font-semibold">{patient.vitals.spo2}%</span>
                          </div>

                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-mono text-slate-700 tabular-nums">
                            <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-500 text-[11px]">Temp:</span>
                            <span className="font-semibold">{patient.vitals.temperature}°F</span>
                          </div>

                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-mono text-slate-700 tabular-nums">
                            <span className="text-slate-500 text-[11px]">Pain:</span>
                            <span className={`font-semibold ${patient.vitals.painScale >= 7 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {patient.vitals.painScale}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right action controls */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* Priority Escalation / Re-triage Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenEscalateId(openEscalateId === patient.id ? null : patient.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
                          title="Re-assess priority if vitals deteriorate"
                        >
                          <ArrowDownUp className="w-3.5 h-3.5 text-slate-500" />
                          <span>Re-triage</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {openEscalateId === patient.id && (
                          <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30">
                            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Change Priority Level
                            </div>
                            {(Object.keys(PRIORITY_LABELS) as PriorityLevel[]).map((level) => {
                              const info = PRIORITY_LABELS[level];
                              const isCurrent = patient.priorityLevel === level;
                              return (
                                <button
                                  key={level}
                                  onClick={() => {
                                    onUpdatePriority(patient.id, level);
                                    setOpenEscalateId(null);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                                    isCurrent ? 'bg-slate-100 font-semibold' : ''
                                  }`}
                                >
                                  <span className={info.color}>{info.code}</span>
                                  {isCurrent && <span className="text-[10px] text-slate-500">Current</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onViewPatient(patient)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Chart
                      </button>

                      {/* Bay selector + Admit */}
                      <select
                        value={selectedBayByPatient[patient.id] || (availableBays.length > 0 ? availableBays[0].id : '')}
                        onChange={(e) => handleBaySelect(patient.id, e.target.value)}
                        disabled={availableBays.length === 0}
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none"
                      >
                        {availableBays.length === 0 ? (
                          <option value="">No Bays Available</option>
                        ) : (
                          availableBays.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))
                        )}
                      </select>

                      <button
                        onClick={() => handleAdmitClick(patient)}
                        disabled={availableBays.length === 0}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors whitespace-nowrap"
                      >
                        <BedDouble className="w-3.5 h-3.5" />
                        <span>Admit to Bay</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
