import { PatientRecord, PriorityLevel } from '../types/patient';

/**
 * Priority Level Numerical Weight (Lower number = Higher Priority)
 * P1 (Resuscitation / Critical) = 1
 * P2 (Emergent) = 2
 * P3 (Urgent) = 3
 * P4 (Less Urgent / Normal) = 4
 * P5 (Non-urgent / Normal) = 5
 */
export const PRIORITY_WEIGHTS: Record<PriorityLevel, number> = {
  P1_CRITICAL: 1,
  P2_EMERGENCY: 2,
  P3_URGENT: 3,
  P4_LESS_URGENT: 4,
  P5_NON_URGENT: 5,
};

export const PRIORITY_LABELS: Record<PriorityLevel, { name: string; code: string; color: string; bg: string; border: string }> = {
  P1_CRITICAL: {
    name: 'Resuscitation / Critical Emergency',
    code: 'Code Red',
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-300 dark:border-rose-800',
  },
  P2_EMERGENCY: {
    name: 'Emergent / High Risk',
    code: 'Code Orange',
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-300 dark:border-orange-800',
  },
  P3_URGENT: {
    name: 'Urgent Emergency',
    code: 'Code Yellow',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-300 dark:border-amber-800',
  },
  P4_LESS_URGENT: {
    name: 'Standard / Less Urgent',
    code: 'Code Green (FIFO)',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
  P5_NON_URGENT: {
    name: 'Routine / Non-Urgent',
    code: 'Code Blue (FIFO)',
    color: 'text-sky-700 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-300 dark:border-sky-800',
  },
};

/**
 * Hospital Emergency Priority Queue
 * 
 * Rules:
 * 1. Emergency cases (P1, P2, P3 or isEmergency = true) ALWAYS jump ahead of Normal cases.
 * 2. Among Emergency cases:
 *    - Higher severity precedes lower severity (P1 > P2 > P3).
 *    - Equal severity follows FIFO based on triage arrival timestamp.
 * 3. Normal cases (P4, P5):
 *    - Strictly follow FIFO (First-In, First-Out) arrival order!
 */
export class EmergencyPriorityQueue {
  private queue: PatientRecord[] = [];

  constructor(initialPatients: PatientRecord[] = []) {
    for (const p of initialPatients) {
      if (p.status === 'Triaged / Waiting') {
        this.enqueue(p);
      }
    }
  }

  /**
   * Compare two patients according to the Emergency Management specification:
   * Returns < 0 if a comes before b, > 0 if b comes before a, 0 if equal.
   */
  public static compare(a: PatientRecord, b: PatientRecord): number {
    const aIsEmergency = a.isEmergency || a.priorityLevel === 'P1_CRITICAL' || a.priorityLevel === 'P2_EMERGENCY' || a.priorityLevel === 'P3_URGENT';
    const bIsEmergency = b.isEmergency || b.priorityLevel === 'P1_CRITICAL' || b.priorityLevel === 'P2_EMERGENCY' || b.priorityLevel === 'P3_URGENT';

    // 1. Emergency vs Normal rule: Emergency jumps ahead
    if (aIsEmergency && !bIsEmergency) return -1;
    if (!aIsEmergency && bIsEmergency) return 1;

    // 2. Both are Emergency cases:
    if (aIsEmergency && bIsEmergency) {
      const weightA = PRIORITY_WEIGHTS[a.priorityLevel];
      const weightB = PRIORITY_WEIGHTS[b.priorityLevel];
      if (weightA !== weightB) {
        return weightA - weightB; // Smaller weight = higher priority
      }
      // Same emergency tier -> FIFO order
      return a.triageTimestamp - b.triageTimestamp;
    }

    // 3. Both are Normal cases:
    // Strictly FIFO order based on arrival timestamp!
    return a.triageTimestamp - b.triageTimestamp;
  }

  /**
   * Enqueue a new patient record into the queue maintaining priority order
   * Time complexity: O(n) insertion into sorted array or heap
   */
  public enqueue(patient: PatientRecord): void {
    // Remove if already present (to prevent duplicates)
    this.remove(patient.id);

    // Find insertion index using binary search or linear probe
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      if (EmergencyPriorityQueue.compare(patient, this.queue[i]) < 0) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, patient);
  }

  /**
   * Dequeue the highest priority patient (Next for treatment)
   * Time complexity: O(1)
   */
  public dequeue(): PatientRecord | null {
    if (this.queue.length === 0) return null;
    return this.queue.shift() || null;
  }

  /**
   * Inspect the next patient in line without removing
   */
  public peek(): PatientRecord | null {
    return this.queue[0] || null;
  }

  /**
   * Remove patient by ID (e.g. if admitted or cancelled)
   */
  public remove(patientId: string): boolean {
    const idx = this.queue.findIndex(p => p.id === patientId);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Dynamically update patient priority level and re-sort queue
   */
  public updatePriority(patientId: string, newLevel: PriorityLevel, isEmergency?: boolean): boolean {
    const idx = this.queue.findIndex(p => p.id === patientId);
    if (idx === -1) return false;

    const patient = { ...this.queue[idx] };
    patient.priorityLevel = newLevel;
    patient.isEmergency = isEmergency !== undefined 
      ? isEmergency 
      : (newLevel === 'P1_CRITICAL' || newLevel === 'P2_EMERGENCY' || newLevel === 'P3_URGENT');
    patient.updatedAt = Date.now();

    // Re-insert into queue
    this.queue.splice(idx, 1);
    this.enqueue(patient);
    return true;
  }

  /**
   * Return an immutable copy of the current queue order
   */
  public getQueue(): PatientRecord[] {
    return [...this.queue];
  }

  public size(): number {
    return this.queue.length;
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  public getEmergencyCount(): number {
    return this.queue.filter(p => p.isEmergency || p.priorityLevel === 'P1_CRITICAL' || p.priorityLevel === 'P2_EMERGENCY' || p.priorityLevel === 'P3_URGENT').length;
  }

  public getNormalCount(): number {
    return this.size() - this.getEmergencyCount();
  }

  /**
   * Find 1-indexed position of a patient in queue
   */
  public getPosition(patientId: string): number {
    const idx = this.queue.findIndex(p => p.id === patientId);
    return idx === -1 ? -1 : idx + 1;
  }
}
