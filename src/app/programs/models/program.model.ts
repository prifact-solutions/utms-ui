import { QuestionPaperSchemaDefn } from '../../shared/form-builder/lib/model/question-paper';
import { QuestionPaper } from 'src/app/program-builder/question-papers/models/question-paper';

export interface ModuleContentWithFiles {
  content: ModuleContent;
  files: ModuleContentFile[];
}
export interface ModuleContent {
  id: number;
  module_id: number;
  title: string;
  order: number;
  content_type: string;
  context_text?: string | null;
  file_id?: number | null;
  exam_id?: number | null;
  created_at: string;
  previous_content_id: number | null;
  duration: number;
}
export interface ModuleContentFile {
  id: number;
  module_content_id: number;
  file_name: string;
  mime_type: string;
  file_content_type: string;
}

export interface Module {
  id: number;
  program: number;
  title?: string;
  order?: number;
  created_at: string;
  module_contents: ModuleContent[];
}

export interface Program {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  duration: number;
  is_active: boolean;
  status: string;
  created_at: string;
  created_by: number;
  categories: number[];
  difficulty?: string;
  video_hours?: number;
  preview_video: string | null;
  short_description?: string;
  modules?: Module[];
  is_enrolled?: boolean;
  allow_enrollment: boolean;
}

export interface ModuleContentFileUrl {
  file_url: string;
}

export interface Exam {
  id: number;
  module_id: number;
  name: string;
  question_paper: number;
  total_score: number;
  minimum_score: number;
  duration_hours: number;
  created_at: string;
}

export interface ModuleContentWithExam {
  content: ModuleContent;
  exam: Exam;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProgramSummary {
  programId: number;
  programName: string;
  studentCount: number;
  avgScore: number;
  avgCompletion: number;
}

export interface StudentProgramReportDetails {
  studentName: string;
  email?: string;
  avgScore: number;
  completionPercentage: number;
  lastActivity: Date;
}
