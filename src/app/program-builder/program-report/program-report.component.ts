import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import {
  Program,
  StudentProgramReportDetails,
} from 'src/app/programs/models/program.model';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-program-report',
  templateUrl: './program-report.component.html',
  styleUrls: ['./program-report.component.scss'],
})
export class ProgramReportComponent extends ComponentBase implements OnInit {
  programId!: number;
  program: Program | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  private detailsByProgramId = new Map<number, StudentProgramReportDetails[]>();
  details: StudentProgramReportDetails[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programsService: ProgramsService,
  ) {
    super();
  }

  ngOnInit(): void {
    let sub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const programId = Number(params.get('program_id'));
          if (!programId) {
            return of(null);
          }
          return this.programsService.getProgramReport(programId);
        })
      )
      .subscribe((reportDetails) => {
        if (!reportDetails) {
          this.router.navigate(['/reports']);
        } else {
          this.details = reportDetails;
        }
      });

    this.registerSubscription(sub);
    const id = this.parseProgramId(this.route.snapshot.params['program_id']);
    if (!id) {
      this.router.navigate(['/reports']);
      return;
    }
    this.programId = id;
    //this.details = this.getMockDetailsForProgram(this.programId);
    this.isLoading = true;
    this.loadProgram(this.programId);
  }

  get averageScoreOverall(): number {
    if (!this.details.length) return 0;
    const sum = this.details.reduce((acc, r) => acc + r.avgScore, 0);
    return Math.round((sum / this.details.length) * 10) / 10;
  }

  get averageCompletionOverall(): number {
    if (!this.details.length) return 0;
    const sum = this.details.reduce(
      (acc, r) => acc + r.completionPercentage,
      0,
    );
    return Math.round((sum / this.details.length) * 10) / 10;
  }

  getRowStatus(
    row: StudentProgramReportDetails,
  ): 'Completed' | 'In Progress' | 'Not Started' {
    if (row.completionPercentage >= 100) return 'Completed';
    if (row.completionPercentage <= 0) return 'Not Started';
    return 'In Progress';
  }

  backToAllPrograms(): void {
    this.router.navigate(['/reports']);
  }

  async exportProgramPdf(): Promise<void> {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ]);

    const programTitle = this.program?.title || `Program ${this.programId}`;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const title = `Program Report – ${programTitle}`;
    doc.setFontSize(14);
    doc.text(title, 40, 40);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

    const head = [
      [
        'Student',
        'Email',
        'Avg score',
        'Completion',
        'Last activity',
        'Status',
      ],
    ];

    const body = this.details.map((r) => [
      r.studentName,
      r.email || '',
      `${Math.round(r.avgScore)}%`,
      `${Math.round(r.completionPercentage)}%`,
      r.lastActivity ? r.lastActivity.toLocaleString() : '',
      this.getRowStatus(r),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 76,
      styles: {
        fontSize: 9,
        cellPadding: 6,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [17, 17, 17],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [247, 249, 250],
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
    });

    const safeName = programTitle
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    doc.save(`program-report-${safeName || this.programId}.pdf`);
  }

  private loadProgram(programId: number): void {
    const sub = this.programsService.getProgramById(programId).subscribe({
      next: (program) => {
        this.program = program;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading program:', error);
        this.errorMessage = 'Failed to load program details. Please try again.';
        this.isLoading = false;
      },
    });
    this.registerSubscription(sub);
  }

  private parseProgramId(value: unknown): number | null {
    const n =
      typeof value === 'string'
        ? +value
        : typeof value === 'number'
          ? value
          : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private makeRng(seed: number): () => number {
    let s = seed >>> 0 || 1;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
  }
}
