export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente';

export interface TaskChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface BoardTask {
  id: string;
  title: string;
  description?: string;
  stageId: string;
  priority: TaskPriority;
  due_date?: string;
  createdAt: string;
  assignedTo?: string;
  assignedBy?: string;
  checklists: TaskChecklistItem[];
  commentsCount: number;
  isConcluded?: boolean;
}

export interface BoardStage {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export interface BoardItem {
  id: string;
  name: string;
  description?: string;
  color: string;
  isArchived: boolean;
  tasksCount: number;
  openTasksCount?: number;
  createdAt: string;
  createdBy?: {
    name?: string;
    groupName?: string;
  };
}

export interface CreateBoardDto {
  name: string;
  description?: string;
  color?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  stageId: string;
  priority: TaskPriority;
  due_date?: string;
  assignedTo?: string;
}

