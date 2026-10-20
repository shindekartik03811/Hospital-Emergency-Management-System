import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Trash2, 
  ExternalLink, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Bed, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { PatientRecord, PatientStatus, PriorityLevel } from '../types/patient';
import { PRIORITY_LABELS } from '../dataStructures/EmergencyQueue';

interface PatientRecordsViewProps {
  records: PatientRecord[];
  onViewRecord: (patient: PatientRecord) => void;
  onDeleteRecord: (patientId: string) => void;
  onOpenRegister: () => void;
}

export const PatientRecordsView: React.FC<PatientRecordsViewProps> = ({
  records,
  onViewRecord,
  onDeleteRecord,
  onOpenRegister,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Filter records
  const filteredRecords = records.filter(p => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || p.priorityLevel === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['ID', 'Full Name', 'Age', 'Gender', 'Blood Group', 'Priority', 'Status', 'Complaint', 'Triaged At', 'Doctor'];
    const rows = records.map(p => [
      `"${p.id}"`,
      `"${p.fullName}"`,
      p.age,
      `"${p.gender}"`,
      `"${p.bloodGroup}"`,
      `"${p.priorityLevel}"`,
      `"${p.status}"`,
      `"${p.chiefComplaint.replace(/"/g, '""')}"`,
      `"${new Date(p.triageTimestamp).toISOString()}"`,
      `"${p.assignedDoctor}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AuraER_Patient_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `AuraER_Linked_List_Records_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold">
              <FileText className="w-4 h-4" />
              <span>DYNAMIC RECORD MAINTENANCE REGISTRY</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Patient Medical Records Archive
            </h1>
            <p className="text-xs text-slate-500">
              Complete dynamic linked list ledger of active and completed emergency cases, discharge summaries, and clinical audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, name, complaint..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="ALL">All Clinical Statuses</option>
              <option value="Triaged / Waiting">Triaged / Waiting</option>
              <option value="In Treatment">In Treatment</option>
              <option value="Discharged Home">Discharged Home</option>
              <option value="Admitted to ICU">Admitted to ICU</option>
              <option value="Admitted to Ward">Admitted to Ward</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="ALL">All Triage Categories</option>
              <option value="P1_CRITICAL">P1 - Resuscitation (Code Red)</option>
              <option value="P2_EMERGENCY">P2 - Emergent (Code Orange)</option>
              <option value="P3_URGENT">P3 - Urgent (Code Yellow)</option>
              <option value="P4_LESS_URGENT">P4 - Less Urgent (Code Green FIFO)</option>
              <option value="P5_NON_URGENT">P5 - Non-Urgent (Code Blue FIFO)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient ID & Name</th>
                <th className="py-3 px-4">Triage Priority</th>
                <th className="py-3 px-4">Acuity / Complaint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Vitals Summary</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No records found matching current query and filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((patient) => {
                  const priority = PRIORITY_LABELS[patient.priorityLevel];
                  const arrivalFormatted = new Date(patient.triageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{patient.fullName}</div>
                        <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                          <span>{patient.id}</span>
                          <span>·</span>
                          <span>{patient.age}y {patient.gender}</span>
                          <span>·</span>
                          <span className="font-bold text-slate-600">{patient.bloodGroup}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${priority.bg} ${priority.color} ${priority.border}`}>
                          {priority.code}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {patient.isEmergency ? 'Emergency Preemption' : 'Normal FIFO'}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-800 line-clamp-1 font-medium">
                          {patient.chiefComplaint}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Triaged at {arrivalFormatted}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          patient.status === 'In Treatment'
                            ? 'bg-amber-100 text-amber-900'
                            : patient.status === 'Triaged / Waiting'
                            ? 'bg-rose-100 text-rose-900'
                            : patient.status === 'Admitted to ICU'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {patient.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] tabular-nums text-slate-600">
                        <div>BP: {patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia} mmHg</div>
                        <div>HR: {patient.vitals.heartRate} bpm · SpO2: {patient.vitals.spo2}%</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewRecord(patient)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Chart
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove record ${patient.id} (${patient.fullName}) from the Linked List?`)) {
                                onDeleteRecord(patient.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Node from Linked List"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
