import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Clock,
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { BoardTask, TaskChecklistItem } from '../types/activitiesBoard.types';
import { toast } from '@/lib/alerts';

interface TaskDetailDrawerProps {
  task: BoardTask | null;
  onClose: () => void;
  onUpdateTask: (updated: BoardTask) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  onUpdateTask,
}) => {
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (task) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [task, onClose]);

  if (!task) return null;

  const handleToggleChecklist = (itemIndex: number) => {
    const updatedChecklists = task.checklists.map((item, idx) =>
      idx === itemIndex ? { ...item, isCompleted: !item.isCompleted } : item
    );
    onUpdateTask({ ...task, checklists: updatedChecklists });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem: TaskChecklistItem = {
      id: `check-${Date.now()}`,
      title: newChecklistText.trim(),
      isCompleted: false,
    };

    onUpdateTask({
      ...task,
      checklists: [...task.checklists, newItem],
    });
    setNewChecklistText('');
    toast.success('Punto de verificación agregado');
  };

  const handleDeleteChecklist = (itemIndex: number) => {
    const updatedChecklists = task.checklists.filter((_, idx) => idx !== itemIndex);
    onUpdateTask({ ...task, checklists: updatedChecklists });
  };

  const completedCount = task.checklists.filter((c) => c.isCompleted).length;
  const progressPercent =
    task.checklists.length > 0
      ? Math.round((completedCount / task.checklists.length) * 100)
      : 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col animate-slideLeft"
      >
        {/* Encabezado */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  task.priority === 'urgente'
                    ? 'bg-rose-100 text-rose-800'
                    : task.priority === 'alta'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                Prioridad {task.priority}
              </span>
              {task.isConcluded && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Concluida
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{task.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block mb-0.5">Asignada a:</span>
              <p className="font-semibold text-slate-800 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                {task.assignedTo || 'Sin asignar'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Fecha límite (SLA):</span>
              <p className="font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {task.due_date || 'Sin fecha límite'}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Descripción
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {task.description || 'Sin descripción detallada.'}
            </p>
          </div>

          {/* Lista de Verificación / Checklists */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>Lista de Verificación / Requisitos</span>
              </h4>
              <span className="text-xs font-bold text-blue-600">
                {completedCount}/{task.checklists.length} ({progressPercent}%)
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Elementos checklist */}
            <div className="space-y-2 mb-3">
              {task.checklists.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer flex-1 select-none">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleToggleChecklist(idx)}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                    <span className={item.isCompleted ? 'line-through text-slate-400' : ''}>
                      {item.title}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteChecklist(idx)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                    title="Eliminar punto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Formulario nuevo ítem */}
            <form onSubmit={handleAddChecklist} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Añadir requisito o entregable..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Creada el {task.createdAt}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

