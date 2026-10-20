import React from 'react';
import { 
  X, 
  Printer, 
  Activity, 
  Heart, 
  Thermometer, 
  Clock, 
  Pill, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  Phone, 
  AlertTriangle,
  Stethoscope
} from 'lucide-react';
import { PatientRecord } from '../types/patient';
import { PRIORITY_LABELS } from '../dataStructures/EmergencyQueue';

interface PatientDetailModalProps {
  patient: PatientRecord;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
}) => {
  const priorityInfo = PRIORITY_LABELS[patient.priorityLevel];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600">
              <Stethoscope className="w-4 h-4" />
              <span>EMERGENCY CLINICAL CHART & AUDIT RECORD</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-slate-500">{patient.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>{patient.fullName}</span>
              <span className="text-xs font-normal text-slate-500">
                ({patient.age}y · {patient.gender} · Blood {patient.bloodGroup})
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Chart</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Priority & Status Ribbon */}
          <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded text-xs font-bold border ${priorityInfo.bg} ${priorityInfo.color} ${priorityInfo.border}`}>
                  {priorityInfo.code}
                </span>
                <span className="font-semibold text-slate-900">{priorityInfo.name}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {patient.isEmergency 
                  ? 'Classified as Emergency case · Preempts normal FIFO cases in queue' 
                  : 'Classified as Normal case · Handled in First-In, First-Out (FIFO) arrival order'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-800">
                Status: {patient.status}
              </span>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Attending: {patient.assignedDoctor}
              </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Triage Vital Signs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-center tabular-nums">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Blood Pressure</span>
                <span className="font-bold text-slate-900 text-sm">{patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia}</span>
                <span className="text-[10px] text-slate-400 block font-sans">mmHg</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Heart Rate</span>
                <span className="font-bold text-slate-900 text-sm">{patient.vitals.heartRate}</span>
                <span className="text-[10px] text-slate-400 block font-sans">bpm</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Oxygen (SpO2)</span>
                <span className={`font-bold text-sm ${patient.vitals.spo2 < 95 ? 'text-rose-600' : 'text-slate-900'}`}>{patient.vitals.spo2}%</span>
                <span className="text-[10px] text-slate-400 block font-sans">pulse ox</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Body Temp</span>
                <span className="font-bold text-slate-900 text-sm">{patient.vitals.temperature}°</span>
                <span className="text-[10px] text-slate-400 block font-sans">Fahrenheit</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-sans">Pain Severity</span>
                <span className="font-bold text-slate-900 text-sm">{patient.vitals.painScale} / 10</span>
                <span className="text-[10px] text-slate-400 block font-sans">Wong-Baker</span>
              </div>
            </div>
          </div>

          {/* Clinical Presentation & Demographics Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">Chief Complaint & Symptoms</h4>
              <p className="text-slate-800 leading-relaxed font-medium">
                {patient.chiefComplaint}
              </p>
              {patient.symptoms && (
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  <span className="font-semibold text-slate-700">Detailed Observations:</span> {patient.symptoms}
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">Medical Background & Contacts</h4>
              <div className="space-y-1 text-[11px]">
                <div><span className="font-semibold text-slate-700">Allergies:</span> {patient.allergies.join(', ') || 'None reported'}</div>
                <div><span className="font-semibold text-slate-700">Medical History:</span> {patient.medicalHistory || 'None'}</div>
                <div><span className="font-semibold text-slate-700">Contact:</span> {patient.contactNumber}</div>
                <div><span className="font-semibold text-slate-700">Next of Kin:</span> {patient.emergencyContact}</div>
              </div>
            </div>
          </div>

          {/* Administered Medications */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-rose-600" />
              <span>Administered Medications ({patient.medications.length})</span>
            </h3>

            {patient.medications.length === 0 ? (
              <p className="text-slate-400 italic text-[11px] p-2 bg-slate-50 rounded border border-slate-100">
                No medications administered during this admission yet.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Medication</th>
                      <th className="py-2 px-3">Dose</th>
                      <th className="py-2 px-3">Route</th>
                      <th className="py-2 px-3">Administered By</th>
                      <th className="py-2 px-3 font-mono">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patient.medications.map(m => (
                      <tr key={m.id}>
                        <td className="py-2 px-3 font-medium text-slate-900">{m.name}</td>
                        <td className="py-2 px-3 font-mono">{m.dose}</td>
                        <td className="py-2 px-3">{m.route}</td>
                        <td className="py-2 px-3 text-slate-600">{m.administeredBy}</td>
                        <td className="py-2 px-3 font-mono text-slate-400">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Discharge Summary if completed */}
          {patient.dischargeSummary && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Discharge Summary & Disposition ({patient.outcome})</span>
              </div>
              <p className="text-emerald-800 text-xs leading-relaxed">
                {patient.dischargeSummary}
              </p>
            </div>
          )}

          {/* Audit Trail Timeline */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Clinical Audit Trail Timeline</span>
            </h3>
            <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-1.5">
              {patient.timeline.map((event, i) => (
                <div key={i} className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{event.action}</span>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-500">{event.actor}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{event.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Chart
          </button>
        </div>
      </div>
    </div>
  );
};
