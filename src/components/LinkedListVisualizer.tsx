import React, { useState } from 'react';
import { 
  GitCommitHorizontal, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Cpu, 
  Database, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Code2
} from 'lucide-react';
import { NodeInspectionInfo, PatientLinkedList } from '../dataStructures/LinkedList';
import { PatientRecord } from '../types/patient';
import { PRIORITY_LABELS } from '../dataStructures/EmergencyQueue';

interface LinkedListVisualizerProps {
  linkedList: PatientLinkedList<PatientRecord>;
  onDeleteRecord: (patientId: string) => void;
  onViewRecord: (patient: PatientRecord) => void;
}

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({
  linkedList,
  onDeleteRecord,
  onViewRecord,
}) => {
  const nodes = linkedList.getNodes();
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isTraversing, setIsTraversing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [traversalLog, setTraversalLog] = useState<string[]>([]);

  // Step-by-step forward traversal
  const runForwardTraversal = () => {
    if (nodes.length === 0) return;
    setIsTraversing(true);
    setTraversalLog(['Starting traversal from HEAD pointer...']);
    
    let currentIdx = 0;
    setHighlightedIndex(0);

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < nodes.length) {
        setHighlightedIndex(currentIdx);
        const node = nodes[currentIdx];
        setTraversalLog(prev => [
          `Dereferencing next pointer -> Reached Node #${currentIdx} [${node.memoryAddress}] (${node.data.fullName})`,
          ...prev.slice(0, 5)
        ]);
      } else {
        clearInterval(interval);
        setIsTraversing(false);
        setTraversalLog(prev => ['Reached TAIL node (next is NULL). Traversal complete!', ...prev]);
      }
    }, 600);
  };

  // Reverse traversal
  const runReverseTraversal = () => {
    if (nodes.length === 0) return;
    setIsTraversing(true);
    setTraversalLog(['Starting reverse traversal from TAIL pointer...']);
    
    let currentIdx = nodes.length - 1;
    setHighlightedIndex(currentIdx);

    const interval = setInterval(() => {
      currentIdx--;
      if (currentIdx >= 0) {
        setHighlightedIndex(currentIdx);
        const node = nodes[currentIdx];
        setTraversalLog(prev => [
          `Dereferencing prev pointer -> Reached Node #${currentIdx} [${node.memoryAddress}] (${node.data.fullName})`,
          ...prev.slice(0, 5)
        ]);
      } else {
        clearInterval(interval);
        setIsTraversing(false);
        setTraversalLog(prev => ['Reached HEAD node (prev is NULL). Reverse traversal complete!', ...prev]);
      }
    }, 600);
  };

  // Step-by-step Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || nodes.length === 0) return;
    const clean = searchQuery.toLowerCase().trim();
    setIsTraversing(true);
    setSearchStatus(`Scanning linked list for "${searchQuery}"...`);

    let currentIdx = 0;
    setHighlightedIndex(0);

    const interval = setInterval(() => {
      const node = nodes[currentIdx];
      const match = node.data.id.toLowerCase().includes(clean) || node.data.fullName.toLowerCase().includes(clean);

      if (match) {
        clearInterval(interval);
        setIsTraversing(false);
        setHighlightedIndex(currentIdx);
        setSearchStatus(`Match found at Node #${currentIdx} (Memory Address: ${node.memoryAddress})!`);
        return;
      }

      currentIdx++;
      if (currentIdx < nodes.length) {
        setHighlightedIndex(currentIdx);
      } else {
        clearInterval(interval);
        setIsTraversing(false);
        setHighlightedIndex(null);
        setSearchStatus(`Reached end of list. No node matching "${searchQuery}" was found.`);
      }
    }, 450);
  };

  const handleReset = () => {
    setHighlightedIndex(null);
    setIsTraversing(false);
    setSearchStatus(null);
    setTraversalLog([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-medium text-xs">
              <Cpu className="w-4 h-4" />
              <span>DYNAMIC DATA STRUCTURE ARCHITECTURE</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300">Doubly Linked List (`PatientLinkedList&lt;T&gt;`)</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Dynamic Linked List Memory Inspector
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every patient registered into AuraER is allocated as a dynamic heap node with simulated pointers (<code className="font-mono text-cyan-300">prev</code>, <code className="font-mono text-cyan-300">next</code>) and memory addresses. Observe pointer dereferencing and bidirectional traversals.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-slate-400">Total Nodes: </span>
              <span className="text-white font-bold tabular-nums">{nodes.length}</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-slate-400">Head: </span>
              <span className="text-cyan-300">{nodes[0]?.memoryAddress || 'NULL'}</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={runForwardTraversal}
              disabled={isTraversing || nodes.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Traverse Head → Tail</span>
            </button>

            <button
              onClick={runReverseTraversal}
              disabled={isTraversing || nodes.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Traverse Tail → Head</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset traversal highlights"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search node ID or Name..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-52"
              />
            </div>
            <button
              type="submit"
              disabled={isTraversing || !searchQuery.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Search Node
            </button>
          </form>
        </div>

        {/* Traversal status message */}
        {searchStatus && (
          <div className="mt-3 p-2 bg-slate-800/80 rounded-lg border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>{searchStatus}</span>
          </div>
        )}
      </div>

      {/* Main Node Chain Canvas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 uppercase tracking-wider">Node Memory Chain</span>
            <span>·</span>
            <span>Horizontal Pointer Links</span>
          </div>
          <span>{nodes.length} Nodes in dynamic memory</span>
        </div>

        {nodes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
            <GitCommitHorizontal className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">
              Linked List Is Empty (HEAD = NULL, TAIL = NULL)
            </h3>
            <p className="text-xs text-slate-500">
              Register a patient to dynamically allocate the first record node in heap memory.
            </p>
          </div>
        ) : (
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
            <div className="inline-flex items-center gap-3 min-w-full pb-2">
              {/* HEAD Pointer Label */}
              <div className="flex flex-col items-center justify-center shrink-0 pr-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                  HEAD
                </span>
                <ArrowRight className="w-5 h-5 text-cyan-400 mt-1 animate-pulse" />
              </div>

              {nodes.map((node, index) => {
                const isHead = index === 0;
                const isTail = index === nodes.length - 1;
                const isHighlighted = highlightedIndex === index;
                const priorityInfo = PRIORITY_LABELS[node.data.priorityLevel];

                return (
                  <React.Fragment key={node.data.id}>
                    {/* Node Box */}
                    <div
                      className={`w-72 shrink-0 rounded-xl border p-4 transition-all duration-300 font-sans ${
                        isHighlighted
                          ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg scale-102'
                          : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500'
                      }`}
                    >
                      {/* Node Header: Index & Memory Address */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Node</span>
                          <span className="text-cyan-400 font-bold">#{index}</span>
                          {isHead && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800">
                              HEAD
                            </span>
                          )}
                          {isTail && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 text-[10px] border border-purple-800">
                              TAIL
                            </span>
                          )}
                        </div>

                        <span className="text-amber-400 font-bold text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          {node.memoryAddress}
                        </span>
                      </div>

                      {/* Node Data Payload */}
                      <div className="py-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-white text-xs truncate">
                            {node.data.fullName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {node.data.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${priorityInfo.bg} ${priorityInfo.color} ${priorityInfo.border}`}>
                            {priorityInfo.code}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-300 truncate text-[11px]">
                            {node.data.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                          {node.data.chiefComplaint}
                        </p>
                      </div>

                      {/* Pointer Addresses Section */}
                      <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[10px]">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>prev:</span>
                          <span className={node.prevAddress ? 'text-cyan-300' : 'text-slate-600'}>
                            {node.prevAddress || 'NULL'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>next:</span>
                          <span className={node.nextAddress ? 'text-cyan-300' : 'text-slate-600'}>
                            {node.nextAddress || 'NULL'}
                          </span>
                        </div>
                      </div>

                      {/* Node Actions */}
                      <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-800/60 text-xs">
                        <button
                          onClick={() => onViewRecord(node.data)}
                          className="text-slate-400 hover:text-cyan-300 transition-colors text-[11px] underline"
                        >
                          Inspect Record
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete node for ${node.data.fullName} from Linked List? Pointers will be reconnected.`)) {
                              onDeleteRecord(node.data.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete node & rewire pointers"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Doubly Linked Pointer Arrows between nodes */}
                    {!isTail && (
                      <div className="flex flex-col items-center justify-center shrink-0 px-1 font-mono text-[10px] text-slate-500 space-y-1">
                        <div className="flex items-center gap-1 text-cyan-400">
                          <span className="text-[9px]">next</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1 text-purple-400">
                          <ArrowLeft className="w-4 h-4" />
                          <span className="text-[9px]">prev</span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* TAIL Pointer Label */}
              <div className="flex flex-col items-center justify-center shrink-0 pl-2">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                  TAIL
                </span>
                <span className="text-[9px] font-mono text-slate-600 mt-1">NEXT=NULL</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Traversal Terminal Logs & Theoretical Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traversal Step Output */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pointer Dereferencing Console</span>
            </span>
            <span>{isTraversing ? 'ACTIVE STEP' : 'IDLE'}</span>
          </div>

          <div className="space-y-1 min-h-[90px] text-[11px]">
            {traversalLog.length === 0 ? (
              <div className="text-slate-500 italic py-4 text-center">
                Click "Traverse Head → Tail" or search a patient to view real-time pointer hops.
              </div>
            ) : (
              traversalLog.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 select-none">&gt;</span>
                  <span className={i === 0 ? 'text-cyan-200 font-semibold' : 'text-slate-400'}>{log}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Big-O Complexity & Architecture Note */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Database className="w-4 h-4 text-rose-600" />
            <span>Why Hospitals Use Linked Lists for Records</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 text-center font-mono">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-[10px] text-slate-400">Append / Prepend</div>
              <div className="text-rose-600 font-bold text-sm">O(1)</div>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-[10px] text-slate-400">Node Deletion</div>
              <div className="text-rose-600 font-bold text-sm">O(1)*</div>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-[10px] text-slate-400">Search / Traversal</div>
              <div className="text-slate-700 font-bold text-sm">O(n)</div>
            </div>
          </div>

          <p className="text-slate-600 text-[11px] leading-relaxed">
            Emergency departments require dynamic heap memory allocation because patient volume fluctuates unpredictably without a fixed upper bound. Inserting urgent incoming records takes constant O(1) time without contiguous memory reallocation.
          </p>
        </div>
      </div>
    </div>
  );
};
