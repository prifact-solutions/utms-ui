import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponentBase } from 'src/app/common/componentbase';
import {
  Exam,
  Module,
  ModuleContent,
  ModuleContentWithExam,
  Program,
} from 'src/app/programs/models/program.model';
import {
  QuestionPaper,
  QuestionPaperStatus,
} from '../question-papers/models/question-paper';
import { Subject, takeUntil } from 'rxjs';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionPapersService } from '../question-papers/services/question-papers.service';

@Component({
  selector: 'app-edit-exam',
  templateUrl: './edit-exam.component.html',
  styleUrls: ['./edit-exam.component.scss'],
})
export class EditExamComponent extends ComponentBase implements OnInit, OnDestroy {
  @Input() inModal = false;
  @Input() set programIdInput(id: number) { if (id) this.programId = id; }
  @Input() set moduleIdInput(id: number) { if (id) this.moduleId = id; }
  @Input() set contentIdInput(id: number) { if (id) this.moduleContentId = id; }
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  program: Program | null = null;
  module: Module | null = null;
  examForm!: FormGroup;
  programId!: number;
  moduleId!: number;
  exam_id!: number;
  examContent!: ModuleContentWithExam;

  moduleContentId!: number;
  previous_order: number = 1;
  isLoading = false;

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  questionPapers: QuestionPaper[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private programsService: ProgramsService,
    private route: ActivatedRoute,
    public router: Router,
    private qpService: QuestionPapersService,
  ) {
    super();
  }

  ngOnInit(): void {
    if (!this.inModal) {
      this.programId = +this.route.snapshot.params['program_id'];
      this.moduleId = +this.route.snapshot.params['module_id'];
      this.moduleContentId = +this.route.snapshot.params['content_id'];
      this.previous_order =
        +this.route.snapshot.queryParams['previous_order'] || 1;
      this.exam_id = +this.route.snapshot.params['exam_id'];
    }
    this.fetchData();
    this.loadExam();
  }

  private fetchData(): void {
    this.programsService
      .getProgramById(this.programId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((program) => (this.program = program));

    this.programsService
      .getModulesForProgram(this.programId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((modules) => {
        this.module = modules.find((m) => m.id === this.moduleId) || null;
      });
  }

  private loadExam(): void {
    this.isLoading = true;
    this.programsService
      .getExam(this.programId, this.moduleId, this.moduleContentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (content: ModuleContentWithExam) => {
          this.examContent = content;
          this.initializeForm();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to load exam';
          this.isLoading = false;
        },
      });
  }

  private initializeForm(): void {
    this.qpService
      .getAllQuestionPapersForProgram(this.programId)
      .subscribe((questionPapers) => {
        this.questionPapers = questionPapers.filter(
          (qp) => qp.status == QuestionPaperStatus.ACTIVE,
        );
        this.examForm = this.fb.group({
          title: [
            this.examContent.exam.name,
            [Validators.required, Validators.minLength(3)],
          ],
          context_text: [this.examContent.content.context_text],
          total_score: [
            this.examContent.exam.total_score,
            [Validators.required, Validators.min(1)],
          ],
          min_score: [
            this.examContent.exam.minimum_score,
            [Validators.required, Validators.min(1)],
          ],
          duration: [
            this.examContent.exam.duration_hours,
            [Validators.required, Validators.min(1)],
          ],
          question_paper: [
            this.examContent.exam.question_paper,
            Validators.required,
          ],
          order: [this.examContent.content.order, Validators.required],
        });
      });
  }

  onSubmit(): void {
    if (this.examForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (
      this.examForm.get('total_score')?.value <
      this.examForm.get('min_score')?.value
    ) {
      this.errorMessage = 'Total score must be greater than Qualifying score';
      return;
    }

    const selectedQPId = this.examForm.get('question_paper')?.value;
    const selectedQP = this.questionPapers.find((qp) => qp.id == selectedQPId);
    if (selectedQP?.total_score != this.examForm.get('total_score')?.value) {
      this.errorMessage =
        'Total scores of the exam and the selected question paper must match';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const contentPayload: Partial<ModuleContent> = {
      title: this.examForm.get('title')?.value,
      content_type: this.examForm.get('content_type')?.value,
      context_text: this.examForm.get('context_text')?.value,
      duration: this.examForm.get('duration')?.value * 60,
      order: this.examForm.get('order')?.value,
    };

    const examPayload: Partial<Exam> = {
      name: this.examForm.get('title')?.value,
      total_score: this.examForm.get('total_score')?.value,
      minimum_score: this.examForm.get('min_score')?.value,
      duration_hours: this.examForm.get('duration')?.value,
      question_paper: this.examForm.get('question_paper')?.value,
    };

    this.programsService
      .updateExam(this.programId, this.moduleId, this.examContent.exam.id, {
        content: contentPayload,
        exam: examPayload,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exam: ModuleContent) => {
          this.moduleContentId = exam.id;
          this.successMessage = 'Exam updated successfully!';
          this.isSubmitting = false;
          if (this.inModal) {
            this.saved.emit();
          } else {
            setTimeout(() => {
              this.router.navigateByUrl(
                `/programs-builder/${this.programId}/modules/${this.moduleId}/lessons`,
              );
            }, 2000);
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to create exam';
          this.isSubmitting = false;
        },
      });
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
