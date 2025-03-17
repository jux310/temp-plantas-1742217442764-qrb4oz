import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, Plus, X } from 'lucide-react';
import { WorkOrder } from '../types';
import { useIssues } from '../hooks/useIssues';
import { differenceInDays } from 'date-fns';
import { IssueDetailsModal } from './IssueDetailsModal';
import { NewIssueForm } from './NewIssueForm';

interface Issue {
  id: string;
  work_order_id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

interface IssueTrackerProps {
  workOrders: WorkOrder[];
  location: 'INCO' | 'ANTI';
}

function PriorityBadge({ priority }: { priority: Issue['priority'] }) {
  const colors = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };

  const priorityLabels = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
  };

  const icons = {
    LOW: <Clock className="w-4 h-4" />,
    MEDIUM: <AlertCircle className="w-4 h-4" />,
    HIGH: <AlertTriangle className="w-4 h-4" />,
    CRITICAL: <AlertTriangle className="w-4 h-4" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
      {icons[priority]}
      {priorityLabels[priority]}
    </span>
  );
}

function StatusBadge({ status }: { status: Issue['status'] }) {
  const colors = {
    OPEN: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
  };

  const statusLabels = {
    OPEN: 'Abierto',
    RESOLVED: 'Resuelto',
  };

  const icons = {
    OPEN: <AlertCircle className="w-4 h-4" />,
    IN_PROGRESS: <Clock className="w-4 h-4" />,
    RESOLVED: <CheckCircle2 className="w-4 h-4" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {icons[status]}
      {statusLabels[status]}
    </span>
  );
}

export function IssueTracker({ workOrders, location }: IssueTrackerProps) {
  const filteredWorkOrders = workOrders.filter(wo => wo.location === location);
  const { issues, loading, createIssue, updateIssue } = useIssues(filteredWorkOrders);
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'priority'>('date-desc');
  const [filter, setFilter] = useState<'open' | 'resolved'>('open');
  const [showNewIssueForm, setShowNewIssueForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const priorityOrder = {
    'CRITICAL': 0,
    'HIGH': 1,
    'MEDIUM': 2,
    'LOW': 3
  };

  const sortedAndFilteredIssues = issues
  .filter(issue => {
    if (filter === 'open') return issue.status !== 'RESOLVED';
    return issue.status === 'RESOLVED';
  })
  .sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'priority':
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      default:
        return 0;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900">Problemas Reportados</h3>
            <button
              onClick={() => setShowNewIssueForm(true)}
              className="ml-4 inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Nuevo Problema
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('open')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === 'open'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Abiertos
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === 'resolved'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Resueltos
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date-desc">Fecha ↓</option>
                <option value="date-asc">Fecha ↑</option>
                <option value="priority">Prioridad</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {showNewIssueForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Nuevo Problema</h3>
                <button
                  onClick={() => setShowNewIssueForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <NewIssueForm
                workOrders={filteredWorkOrders}
                onSubmit={createIssue}
                onClose={() => setShowNewIssueForm(false)}
                location={location}
              />
            </div>
          </div>
        )}

        {sortedAndFilteredIssues.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No hay problemas reportados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAndFilteredIssues.map(issue => {
              const workOrder = workOrders.find(wo => wo.id === issue.work_order_id);
              return (
                <div
                  key={issue.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{issue.title}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        OT: {workOrder?.ot} - {workOrder?.client}
                        {issue.stage && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>Etapa: {issue.stage}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {issue.delay && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Clock className="w-4 h-4" />
                          {issue.delay.end_date ? (
                            `${differenceInDays(new Date(issue.delay.end_date), new Date(issue.delay.start_date)) + 1} días`
                          ) : (
                            `${differenceInDays(new Date(), new Date(issue.delay.start_date)) + 1} días`
                          )}
                        </span>
                      )}
                      <PriorityBadge priority={issue.priority} />
                      <StatusBadge status={issue.status} />
                    </div>
                  </div>
                  {issue.issue_notes && issue.issue_notes.length > 0 && (
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                      <p className="truncate flex-1">{issue.issue_notes[issue.issue_notes.length - 1].content}</p>
                      <span className="text-gray-500 ml-2 whitespace-nowrap font-medium">
                        {issue.issue_notes[issue.issue_notes.length - 1].user_email?.split('@')[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      Creado el{' '}
                      {new Date(issue.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                    <span>
                      Última actualización:{' '}
                      {new Date(issue.updated_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedIssue && (
          <IssueDetailsModal
            issue={selectedIssue}
            workOrder={workOrders.find(wo => wo.id === selectedIssue.work_order_id)}
            onClose={() => setSelectedIssue(null)}
            onUpdateIssue={async (id, updates) => {
              await updateIssue(id, updates);
            }}
            onUpdateStatus={(status) => {
              updateIssue(selectedIssue.id, { status });
              if (status === 'RESOLVED') {
                setSelectedIssue(null);
              }
            }}
            location={location}
          />
        )}
      </div>
    </div>
  );
}