import { apiClient } from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import {
  BoardItem,
  BoardTask,
  BoardStage,
  CreateBoardDto,
  CreateTaskDto,
} from '../types/activitiesBoard.types';

function normalizeBoardItem(b: any): BoardItem {
  return {
    id: String(b.id || b._id || ''),
    name: b.name || 'Tablero de Actividades',
    description: b.description || '',
    color: b.color || '#2563eb',
    isArchived: Boolean(b.is_archived ?? b.isarchived),
    tasksCount: Number(b.tasks_count ?? b.taskscount ?? b.tasksCount ?? 0),
    openTasksCount: Number(b.open_tasks ?? b.opentasks ?? 0),
    createdAt: b.createdAt ? b.createdAt.split('T')[0] : '2026-11-01',
    createdBy: {
      name: b.createdby?.name || b.createdby?.fullname || 'Usuario',
      groupName: b.createdby?.group?.name || 'Licitaciones',
    },
  };
}

// Mock representativo para tableros
let MOCK_BOARDS: BoardItem[] = [
  {
    id: 'board-01',
    name: 'Licitación IMSS Hospital Siglo XXI',
    description: 'Seguimiento de pliegos, entrega de muestras y apertura de sobres técnicos.',
    color: '#2563eb',
    isArchived: false,
    tasksCount: 8,
    openTasksCount: 5,
    createdAt: '2026-11-01',
    createdBy: {
      name: 'Carlos Méndez',
      groupName: 'Licitaciones Públicas',
    },
  },
  {
    id: 'board-02',
    name: 'Licitación ISSSTE Consolidada 2026',
    description: 'Revisión jurídica, fianzas de sostenimiento y dictamen económico.',
    color: '#059669',
    isArchived: false,
    tasksCount: 12,
    openTasksCount: 4,
    createdAt: '2026-10-25',
    createdBy: {
      name: 'Valeria Robles',
      groupName: 'Adquisiciones',
    },
  },
  {
    id: 'board-03',
    name: 'SEDENA Quirófanos Militares',
    description: 'Visita técnica de obra civil y conexiones de gases medicinales.',
    color: '#d97706',
    isArchived: false,
    tasksCount: 6,
    openTasksCount: 2,
    createdAt: '2026-10-18',
    createdBy: {
      name: 'Ing. Rodrigo Lara',
      groupName: 'Ingeniería Biomédica',
    },
  },
];

let MOCK_STAGES: BoardStage[] = [
  { id: 'stage-1', name: 'Por Iniciar', order: 1, color: '#3b82f6' },
  { id: 'stage-2', name: 'En Proceso', order: 2, color: '#f59e0b' },
  { id: 'stage-3', name: 'En Revisión / Aprobación', order: 3, color: '#8b5cf6' },
  { id: 'stage-4', name: 'Concluida / Entregada', order: 4, color: '#10b981' },
];

let MOCK_TASKS: Record<string, BoardTask[]> = {
  'board-01': [
    {
      id: 'task-101',
      title: 'Elaborar escrito de acreditación de personalidad jurídica',
      description: 'Integrar acta constitutiva, poder notarial e identificación oficial vigente.',
      stageId: 'stage-1',
      priority: 'alta',
      due_date: '2026-11-14',
      createdAt: '2026-11-02',
      assignedTo: 'Lic. Sofía Galindo',
      assignedBy: 'Carlos Méndez',
      checklists: [
        { id: 'c1', title: 'Acta constitutiva cotejada', isCompleted: true },
        { id: 'c2', title: 'Poder notarial de actos de administración', isCompleted: true },
        { id: 'c3', title: 'Constancia de situación fiscal SAT 32D positiva', isCompleted: false },
      ],
      commentsCount: 3,
      isConcluded: false,
    },
    {
      id: 'task-102',
      title: 'Cargar ficha técnica y folletos de tomógrafo 64 cortes',
      description: 'Verificar especificaciones mínimas solicitadas en el anexo técnico numeral 4.',
      stageId: 'stage-2',
      priority: 'urgente',
      due_date: '2026-11-10',
      createdAt: '2026-11-03',
      assignedTo: 'Ing. Rodrigo Lara',
      assignedBy: 'Carlos Méndez',
      checklists: [
        { id: 'c4', title: 'Traducción simple al español por perito', isCompleted: true },
        { id: 'c5', title: 'Carta de respaldo del fabricante en original', isCompleted: false },
      ],
      commentsCount: 5,
      isConcluded: false,
    },
    {
      id: 'task-103',
      title: 'Emisión de fianza de sostenimiento de propuesta económica',
      description: 'Gestionar fianza por el 10% del monto máximo con afianzadora Aserta.',
      stageId: 'stage-3',
      priority: 'alta',
      due_date: '2026-11-12',
      createdAt: '2026-11-04',
      assignedTo: 'Valeria Robles',
      assignedBy: 'Carlos Méndez',
      checklists: [
        { id: 'c6', title: 'Póliza digital XML y PDF sellada', isCompleted: true },
      ],
      commentsCount: 2,
      isConcluded: false,
    },
    {
      id: 'task-104',
      title: 'Asistencia y acta de junta de aclaraciones',
      description: 'Presentación de 14 preguntas técnicas al convocante.',
      stageId: 'stage-4',
      priority: 'media',
      due_date: '2026-11-05',
      createdAt: '2026-10-30',
      assignedTo: 'Carlos Méndez',
      assignedBy: 'Dirección',
      checklists: [
        { id: 'c7', title: 'Acuse de recepción de preguntas', isCompleted: true },
        { id: 'c8', title: 'Acta firmada descargada de Compranet', isCompleted: true },
      ],
      commentsCount: 1,
      isConcluded: true,
    },
  ],
};

export const activitiesBoardService = {
  // 1. Obtener lista de tableros (pm/boards)
  async getBoards(isArchived = false): Promise<BoardItem[]> {
    const user = useAuthStore.getState().user as any;
    const groupId = user?.groupId || (typeof user?.group === 'object' ? user?.group?.id : user?.group);

    // 1. Construir query idéntico a crm-jobs (con 'is_archived')
    let query: Record<string, any> = {
      is_archived: isArchived,
    };
    if (groupId) {
      query.createdby = { groupId };
    } else if (user?.id) {
      query.createdbyId = user.id;
    }

    try {
      const response = await apiClient.get('pm/boards', {
        params: {
          count: 1,
          limit: 30,
          where: JSON.stringify(query),
          include: 'createdby,createdby.group',
        },
        skipGlobalErrorAlert: true,
      });

      if (response.data?.results && Array.isArray(response.data.results)) {
        return response.data.results.map(normalizeBoardItem);
      }
    } catch {
      // Fallback 1: Reintentar sin filtro de creador por si la asociación de grupo falla en backend
      try {
        const fallbackRes = await apiClient.get('pm/boards', {
          params: {
            count: 1,
            limit: 30,
            where: JSON.stringify({ is_archived: isArchived }),
          },
          skipGlobalErrorAlert: true,
        });

        if (fallbackRes.data?.results && Array.isArray(fallbackRes.data.results)) {
          return fallbackRes.data.results.map(normalizeBoardItem);
        }
      } catch {
        // Silencioso: cae al mock consistente si el backend dev aún no tiene boards
      }
    }

    return MOCK_BOARDS.filter((b) => b.isArchived === isArchived);
  },

  // 2. Crear nuevo tablero (pm/boards)
  async createBoard(dto: CreateBoardDto): Promise<BoardItem> {
    const user = useAuthStore.getState().user;
    try {
      const response = await apiClient.post(
        'pm/boards',
        {
          name: dto.name,
          description: dto.description || '',
          color: dto.color || '#2563eb',
          createdbyId: user?.id,
        },
        {
          skipGlobalErrorAlert: true,
        }
      );

      if (response.data) {
        const b = response.data;
        const newBoard = normalizeBoardItem(b);
        MOCK_BOARDS = [newBoard, ...MOCK_BOARDS];
        return newBoard;
      }
    } catch {
      // Mock fallback
    }

    const newBoard: BoardItem = {
      id: `board-${Date.now()}`,
      name: dto.name,
      description: dto.description || '',
      color: dto.color || '#2563eb',
      isArchived: false,
      tasksCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: {
        name: user?.name || user?.username || 'Carlos Méndez',
        groupName: 'Licitaciones',
      },
    };
    MOCK_BOARDS = [newBoard, ...MOCK_BOARDS];
    return newBoard;
  },

  // 3. Obtener un tablero por ID
  async getBoardById(boardId: string): Promise<BoardItem | null> {
    const boards = await this.getBoards(false);
    return boards.find((b) => b.id === boardId) || MOCK_BOARDS[0];
  },

  // 4. Obtener columnas/etapas de un tablero
  async getStages(): Promise<BoardStage[]> {
    return MOCK_STAGES;
  },

  // 5. Obtener tareas de un tablero (pm/tasks/stagev2/:id)
  async getTasks(boardId: string): Promise<BoardTask[]> {
    try {
      const response = await apiClient.get(`/pm/tasks/stagev2/${boardId}`, {
        params: { limit: 50 },
        skipGlobalErrorAlert: true,
      });

      if (response.data?.columns) {
        const list: BoardTask[] = [];
        Object.values(response.data.columns).forEach((col: any) => {
          if (Array.isArray(col.tasks)) {
            col.tasks.forEach((t: any) => {
              list.push({
                id: t.id || t._id,
                title: t.title || t.name,
                description: t.description || '',
                stageId: t.stageId || col.id,
                priority: t.priority || 'media',
                due_date: t.due_date ? t.due_date.split('T')[0] : undefined,
                createdAt: t.createdAt ? t.createdAt.split('T')[0] : '2026-11-01',
                assignedTo: t.assignedto?.name || 'Sin asignar',
                assignedBy: t.assignedby?.name || 'Licitaciones',
                checklists: t.checklists || [],
                commentsCount: t.commentscount || 0,
                isConcluded: Boolean(t.isconcluded),
              });
            });
          }
        });
        if (list.length > 0) return list;
      }
    } catch {
      // Mock fallback
    }

    return MOCK_TASKS[boardId] || MOCK_TASKS['board-01'] || [];
  },

  // 6. Crear tarea en un tablero (pm/tasks/)
  async createTask(boardId: string, dto: CreateTaskDto): Promise<BoardTask> {
    try {
      const response = await apiClient.post('/pm/tasks/', {
        title: dto.title,
        description: dto.description || '',
        stageId: dto.stageId,
        boardId: boardId,
        priority: dto.priority,
        due_date: dto.due_date,
      });

      if (response.data) {
        const t = response.data;
        return {
          id: t.id || `task-${Date.now()}`,
          title: t.title || dto.title,
          description: t.description || dto.description || '',
          stageId: t.stageId || dto.stageId,
          priority: dto.priority,
          due_date: dto.due_date,
          createdAt: new Date().toISOString().split('T')[0],
          assignedTo: dto.assignedTo || 'GABL Licitaciones',
          checklists: [],
          commentsCount: 0,
          isConcluded: false,
        };
      }
    } catch {
      // Mock
    }

    const newTask: BoardTask = {
      id: `task-${Date.now()}`,
      title: dto.title,
      description: dto.description || '',
      stageId: dto.stageId,
      priority: dto.priority,
      due_date: dto.due_date,
      createdAt: new Date().toISOString().split('T')[0],
      assignedTo: dto.assignedTo || 'GABL Licitaciones',
      checklists: [],
      commentsCount: 0,
      isConcluded: false,
    };

    if (!MOCK_TASKS[boardId]) {
      MOCK_TASKS[boardId] = [];
    }
    MOCK_TASKS[boardId] = [newTask, ...MOCK_TASKS[boardId]];
    return newTask;
  },

  // 7. Mover tarea a otra columna / etapa
  async updateTaskStage(taskId: string, stageId: string, isConcluded = false): Promise<void> {
    try {
      await apiClient.put(`/pm/tasks/${taskId}`, {
        stageId,
        isconcluded: isConcluded,
      });
    } catch {
      // Mock
    }
  },

  // 8. Archivar o reactivar tablero
  async toggleArchiveBoard(boardId: string, archive: boolean): Promise<void> {
    try {
      await apiClient.put(`/pm/boards/${boardId}`, {
        isarchived: archive,
      });
    } catch {
      // Mock
    }
    MOCK_BOARDS = MOCK_BOARDS.map((b) =>
      b.id === boardId ? { ...b, isArchived: archive } : b
    );
  },
};

