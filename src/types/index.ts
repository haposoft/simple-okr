export interface Department {
  id: string;
  name: string;
  objectives: Objective[];
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  departmentId: string;
  department?: Department;
}

export interface DepartmentProgress {
  departmentName: string;
  progress: number;
}

export interface MonthlyProgress {
  month: string;
  progress: number;
}

export interface ReportData {
  totalObjectives: number;
  completedObjectives: number;
  activeObjectives: number;
  departmentProgress: DepartmentProgress[];
  monthlyProgress: MonthlyProgress[];
} 