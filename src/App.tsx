/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header';
import { QueueManager } from './components/QueueManager';
import { TreatmentBaysView } from './components/TreatmentBaysView';
import { PatientRegistrationModal } from './components/PatientRegistrationModal';
import { LinkedListVisualizer } from './components/LinkedListVisualizer';
import { PatientRecordsView } from './components/PatientRecordsView';
import { PatientDetailModal } from './components/PatientDetailModal';
import { TreatmentCompletionModal } from './components/TreatmentCompletionModal';
import { SimulationModal } from './components/SimulationModal';

import { PatientRecord, TreatmentBay, PriorityLevel } from './types/patient';
import { PatientLinkedList } from './dataStructures/LinkedList';
import { EmergencyPriorityQueue } from './dataStructures/EmergencyQueue';
import { INITIAL_PATIENTS, INITIAL_BAYS } from './utils/samplePatients';
import { 
  playRegistrationChime, 
  playEmergencyAlarm, 
  playTreatmentCompleteChime 
} from './utils/audioAlerts';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const STORAGE_KEY_PATIENTS = 'auraer_patients_v1';
const STORAGE_KEY_BAYS = 'auraer_bays_v1';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('queue');

  // Core Data Structures State
  const [records, setRecords] = useState<PatientRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PATIENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PATIENTS;
  });

  const [bays, setBays] = useState<TreatmentBay[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BAYS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_BAYS;
  });

  // Doubly Linked List instance
  const linkedList = useMemo(() => {
    return PatientLinkedList.fromArray(records);
  }, [records]);

  // Priority Queue instance
  const priorityQueue = useMemo(() => {
    return new EmergencyPriorityQueue(records);
  }, [records]);

  const queueList = useMemo(() => {
    return priorityQueue.getQueue();
  }, [priorityQueue]);

  // Patients map for fast ID lookup
  const patientsMap = useMemo(() => {
    const map = new Map<string, PatientRecord>();
    for (const r of records) {
      map.set(r.id, r);
    }
    return map;
  }, [records]);

  // Active Modals state
  const [viewingPatient, setViewingPatient] = useState<PatientRecord | null>(null);
  const [completingPatient, setCompletingPatient] = useState<PatientRecord | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'emergency' | 'success' | 'info' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(records));
      localStorage.setItem(STORAGE_KEY_BAYS, JSON.stringify(bays));
    } catch {
      // Ignore storage quota
    }
  }, [records, bays]);

  // Toast Auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Register / Add Patient Handler
  const handleRegisterPatient = useCallback((newPatient: PatientRecord) => {
    setRecords((prev) => [newPatient, ...prev]);

    // Audio cue
    if (newPatient.isEmergency || newPatient.priorityLevel === 'P1_CRITICAL' || newPatient.priorityLevel === 'P2_EMERGENCY') {
      playEmergencyAlarm();
      setToast({
        message: `🚨 Emergency Alert: ${newPatient.fullName} registered with high acuity! Preempted to front of queue.`,
        type: 'emergency',
      });
    } else {
      playRegistrationChime();
      setToast({
        message: `✓ Patient ${newPatient.fullName} registered. Placed in Normal FIFO queue.`,
        type: 'success',
      });
    }

    setActiveTab('queue');
  }, []);

  // Admit Patient to Bay Handler
  const handleAdmitPatient = useCallback((patientId: string, bayId: string) => {
    const bay = bays.find((b) => b.id === bayId);
    if (!bay || bay.isOccupied) return;

    setRecords((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const now = Date.now();
          return {
            ...p,
            status: 'In Treatment',
            assignedBayId: bayId,
            treatmentStartedAt: now,
            updatedAt: now,
            timeline: [
              ...p.timeline,
              {
                timestamp: now,
                action: `Admitted to ${bay.name}`,
                note: `Moved from waiting queue into ${bay.type} for direct care.`,
                actor: 'ER Charge Nurse',
              },
            ],
          };
        }
        return p;
      })
    );

    setBays((prev) =>
      prev.map((b) => {
        if (b.id === bayId) {
          return { ...b, isOccupied: true, currentPatientId: patientId };
        }
        return b;
      })
    );

    playRegistrationChime();
    setToast({
      message: `Patient admitted to ${bay.name}. Bay is now actively occupied.`,
      type: 'info',
    });
  }, [bays]);

  // Escalate / Update Priority
  const handleUpdatePriority = useCallback((patientId: string, newLevel: PriorityLevel) => {
    const isEmergency = newLevel === 'P1_CRITICAL' || newLevel === 'P2_EMERGENCY' || newLevel === 'P3_URGENT';

    setRecords((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const now = Date.now();
          return {
            ...p,
            priorityLevel: newLevel,
            isEmergency,
            updatedAt: now,
            timeline: [
              ...p.timeline,
              {
                timestamp: now,
                action: 'Triage Priority Re-assessed',
                note: `Condition changed to ${newLevel}. Queue position recalculated.`,
                actor: 'Attending Triage Physician',
              },
            ],
          };
        }
        return p;
      })
    );

    if (isEmergency) {
      playEmergencyAlarm();
      setToast({
        message: `Priority escalated to ${newLevel}. Patient has moved forward in priority queue!`,
        type: 'emergency',
      });
    } else {
      setToast({
        message: `Priority adjusted to ${newLevel}. Queue positions updated.`,
        type: 'info',
      });
    }
  }, []);

  // Complete Treatment
  const handleCompleteTreatment = useCallback((
    patientId: string,
    outcome: 'Discharged Home' | 'Admitted to ICU' | 'Admitted to Ward' | 'Transferred',
    dischargeSummary: string
  ) => {
    const now = Date.now();
    let bayIdToVacate: string | null = null;

    setRecords((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          bayIdToVacate = p.assignedBayId;
          return {
            ...p,
            status: outcome,
            treatmentCompletedAt: now,
            outcome,
            dischargeSummary,
            assignedBayId: null,
            updatedAt: now,
            timeline: [
              ...p.timeline,
              {
                timestamp: now,
                action: `Treatment Finalized: ${outcome}`,
                note: dischargeSummary,
                actor: 'Attending ER Physician',
              },
            ],
          };
        }
        return p;
      })
    );

    // Vacate the bay
    setBays((prev) =>
      prev.map((b) => {
        if (b.currentPatientId === patientId || (bayIdToVacate && b.id === bayIdToVacate)) {
          return { ...b, isOccupied: false, currentPatientId: null };
        }
        return b;
      })
    );

    setCompletingPatient(null);
    playTreatmentCompleteChime();
    setToast({
      message: `Treatment completed: Patient recorded as ${outcome}. Treatment bay sanitized and marked available!`,
      type: 'success',
    });
  }, []);

  // Add Medication
  const handleAddMedication = useCallback((patientId: string, name: string, dose: string, route: string) => {
    const now = Date.now();
    setRecords((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const newMed = {
            id: `med-${now}`,
            name,
            dose,
            route,
            timestamp: now,
            administeredBy: 'Emergency RN',
          };
          return {
            ...p,
            medications: [...p.medications, newMed],
            updatedAt: now,
            timeline: [
              ...p.timeline,
              {
                timestamp: now,
                action: `Medication Given: ${name}`,
                note: `${dose} via ${route}`,
                actor: 'Emergency RN',
              },
            ],
          };
        }
        return p;
      })
    );
    setToast({
      message: `Administered ${name} (${dose}) to patient.`,
      type: 'info',
    });
  }, []);

  // Add Clinical Note
  const handleAddNote = useCallback((patientId: string, note: string) => {
    const now = Date.now();
    setRecords((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            clinicalNotes: p.clinicalNotes ? `${p.clinicalNotes} | ${note}` : note,
            updatedAt: now,
            timeline: [
              ...p.timeline,
              {
                timestamp: now,
                action: 'Clinical Note Added',
                note,
                actor: 'Attending Physician',
              },
            ],
          };
        }
        return p;
      })
    );
  }, []);

  // Delete Record from Linked List
  const handleDeleteRecord = useCallback((patientId: string) => {
    setRecords((prev) => prev.filter((p) => p.id !== patientId));
    setBays((prev) =>
      prev.map((b) => {
        if (b.currentPatientId === patientId) {
          return { ...b, isOccupied: false, currentPatientId: null };
        }
        return b;
      })
    );
    setToast({
      message: `Record ${patientId} deleted from Linked List. Next/prev pointers reconnected.`,
      type: 'info',
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        waitingCount={queueList.length}
        emergencyCount={priorityQueue.getEmergencyCount()}
        onOpenSimModal={() => setIsSimModalOpen(true)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-3.5 rounded-xl border shadow-lg flex items-center justify-between gap-3 text-xs font-medium ${
              toast.type === 'emergency'
                ? 'bg-rose-900 text-white border-rose-700'
                : toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'emergency' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'queue' && (
          <QueueManager
            queue={queueList}
            bays={bays}
            onAdmitPatient={handleAdmitPatient}
            onUpdatePriority={handleUpdatePriority}
            onViewPatient={(p) => setViewingPatient(p)}
            onOpenRegister={() => setActiveTab('register')}
            onOpenSimulation={() => setIsSimModalOpen(true)}
          />
        )}

        {activeTab === 'bays' && (
          <TreatmentBaysView
            bays={bays}
            patientsMap={patientsMap}
            nextQueuePatient={queueList[0] || null}
            onAdmitPatient={handleAdmitPatient}
            onOpenCompleteModal={(p) => setCompletingPatient(p)}
            onAddMedication={handleAddMedication}
            onAddNote={handleAddNote}
            onViewPatient={(p) => setViewingPatient(p)}
          />
        )}

        {activeTab === 'register' && (
          <PatientRegistrationModal
            onRegister={handleRegisterPatient}
            isStandalonePage={true}
          />
        )}

        {activeTab === 'linkedlist' && (
          <LinkedListVisualizer
            linkedList={linkedList}
            onDeleteRecord={handleDeleteRecord}
            onViewRecord={(p) => setViewingPatient(p)}
          />
        )}

        {activeTab === 'records' && (
          <PatientRecordsView
            records={records}
            onViewRecord={(p) => setViewingPatient(p)}
            onDeleteRecord={handleDeleteRecord}
            onOpenRegister={() => setActiveTab('register')}
          />
        )}
      </main>

      {/* Modals */}
      {viewingPatient && (
        <PatientDetailModal
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
        />
      )}

      {completingPatient && (
        <TreatmentCompletionModal
          patient={completingPatient}
          bayName={
            bays.find((b) => b.id === completingPatient.assignedBayId)?.name ||
            'Emergency Treatment Bay'
          }
          onComplete={handleCompleteTreatment}
          onClose={() => setCompletingPatient(null)}
        />
      )}

      {isSimModalOpen && (
        <SimulationModal
          onSimulatePatient={handleRegisterPatient}
          onClose={() => setIsSimModalOpen(false)}
        />
      )}

      {/* Minimalist Clinical Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AuraER Emergency Management</span>
            <span>·</span>
            <span>Priority Queue & Dynamic Linked List Engine</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] tabular-nums">
            <span>Patients in Memory: {records.length}</span>
            <span>·</span>
            <span>Waiting in Queue: {queueList.length}</span>
            <span>·</span>
            <span>Active Bays: {bays.filter((b) => b.isOccupied).length} / {bays.length}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
