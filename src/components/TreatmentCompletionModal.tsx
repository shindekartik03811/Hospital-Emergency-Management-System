import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  Clock, 
  FileCheck, 
  Bed, 
  ArrowRight, 
  Home, 
  ShieldAlert, 
  Stethoscope 
} from 'lucide-react';
import { PatientRecord } from '../types/patient';

interface TreatmentCompletionModalProps {
  patient: PatientRecord;
  bayName: string;
  onComplete: (
    patientId: string, 
    outcome: 'Discharged Home' | 'Admitted to ICU' | 'Admitted to Ward' | 'Transferred',
    dischargeSummary: string
  ) => void;
  onClose: () => void;
}

export const TreatmentCompletionModal: React.FC<TreatmentCompletionModalProps> = ({
  patient,
  bayName,
  onComplete,
  onClose,
}) => {
  const [outcome, setOutcome] = useState<'Discharged Home' | 'Admitted to ICU' | 'Admitted to Ward' | 'Transferred'>('Discharged Home');
  const [dischargeSummary, setDischargeSummary] = useState(
    'Patient stabilized following acute intervention. Vital signs normalized. Symptoms resolved. Prescriptions provided with 48h primary care follow-up.'
  );

  const durationMin = patient.treatmentStartedAt 
    ? Math.max(1, Math.floor((Date.now() - patient.treatmentStartedAt) / 60000))
    : 15;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dischargeSummary.trim()) {
      alert('Please enter a discharge summary or clinical handoff note.');
      return;
    }
    onComplete(patient.id, outcome, dischargeSummary.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>CLINICAL TREATMENT COMPLETION</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Discharge / Admission Order
            </h3>
            <p className="text-xs text-slate-500">
              Vacating <span className="font-semibold text-slate-700">{bayName}</span> · Updating linked list record
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Summary Strip */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-slate-900">{patient.fullName}</div>
            <div className="text-slate-500 font-mono text-[11px]">
              ID: {patient.id} · {patient.age}y {patient.gender} · Blood {patient.bloodGroup}
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-slate-700 flex items-center gap-1 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{durationMin} min duration</span>
            </div>
            <div className="text-slate-400 text-[11px]">Emergency Care Completed</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Clinical Disposition / Outcome
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOutcome('Discharged Home')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                  outcome === 'Discharged Home'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Home className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <div className="font-semibold">Discharged Home</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-normal">Stable, ambulatory, home care instructions</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('Admitted to ICU')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                  outcome === 'Admitted to ICU'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold ring-1 ring-rose-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <div className="font-semibold">Admitted to ICU</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-normal">Continuous invasive monitoring needed</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('Admitted to Ward')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                  outcome === 'Admitted to Ward'
                    ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold ring-1 ring-sky-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Bed className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
                <div>
                  <div className="font-semibold">General Ward</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-normal">Subacute inpatient floor care</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('Transferred')}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                  outcome === 'Transferred'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold ring-1 ring-amber-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <div className="font-semibold">Surgical / Transferred</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-normal">Operating room or specialized facility</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Discharge / Handoff Summary & Instructions
            </label>
            <textarea
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>Finalize & Update Linked List Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
