import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { Program } from 'src/app/programs/models/program.model';

type ProgramReportRow = {
  studentName: string;
  email?: string;
  avgScore: number; // 0..100
  completionPct: number; // 0..100
  lastActivity: Date;
};

@Component({
  selector: 'app-program-report',
  templateUrl: './program-report.component.html',
  styleUrls: ['./program-report.component.scss']
})
export class ProgramReportComponent extends ComponentBase implements OnInit {
  programs: Program[] = [];
  programId: number | null = null;
  selectedProgramId: number | null = null;
  program: Program | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  isProgramsLoading = false;

  details: ProgramReportRow[] = [
    {
      studentName: 'Asha Nair',
      email: 'asha.nair@example.com',
      avgScore: 88,
      completionPct: 92,
      lastActivity: new Date('2026-03-09T14:20:00')
    },
    {
      studentName: 'Rahul Menon',
      email: 'rahul.menon@example.com',
      avgScore: 74,
      completionPct: 61,
      lastActivity: new Date('2026-03-11T10:05:00')
    },
    {
      studentName: 'Divya Krishnan',
      email: 'divya.k@example.com',
      avgScore: 95,
      completionPct: 100,
      lastActivity: new Date('2026-03-07T18:45:00')
    },
    {
      studentName: 'Nikhil George',
      email: 'nikhil.george@example.com',
      avgScore: 66,
      completionPct: 40,
      lastActivity: new Date('2026-03-03T09:15:00')
    },
    {
      studentName: 'Meera Pillai',
      email: 'meera.p@example.com',
      avgScore: 81,
      completionPct: 78,
      lastActivity: new Date('2026-03-12T08:30:00')
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private programsService: ProgramsService
  ) {
    super();
  }

  ngOnInit(): void {
    const initialProgramId = this.parseProgramId(this.route.snapshot.params['program_id']);
    this.loadProgramsAndDefault(initialProgramId);
  }

  get averageScoreOverall(): number {
    if (!this.details.length) return 0;
    const sum = this.details.reduce((acc, r) => acc + r.avgScore, 0);
    return Math.round((sum / this.details.length) * 10) / 10;
  }

  get averageCompletionOverall(): number {
    if (!this.details.length) return 0;
    const sum = this.details.reduce((acc, r) => acc + r.completionPct, 0);
    return Math.round((sum / this.details.length) * 10) / 10;
  }

  getRowStatus(row: ProgramReportRow): 'Completed' | 'In Progress' | 'Not Started' {
    if (row.completionPct >= 100) return 'Completed';
    if (row.completionPct <= 0) return 'Not Started';
    return 'In Progress';
  }

  async exportPdf(): Promise<void> {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const programTitle = this.program?.title || (this.programId ? `Program ${this.programId}` : 'Program');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    const title = `Program Report – ${programTitle}`;
    doc.setFontSize(14);
    doc.text(title, 40, 40);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

    const head = [[
      'Student',
      'Email',
      'Avg score',
      'Completion',
      'Last activity',
      'Status'
    ]];

    const body = this.details.map(r => ([
      r.studentName,
      r.email || '',
      `${Math.round(r.avgScore)}%`,
      `${Math.round(r.completionPct)}%`,
      r.lastActivity ? r.lastActivity.toLocaleString() : '',
      this.getRowStatus(r)
    ]));

    autoTable(doc, {
      head,
      body,
      startY: 76,
      styles: {
        fontSize: 9,
        cellPadding: 6,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [17, 17, 17],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [247, 249, 250]
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    const safeName = programTitle.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
    doc.save(`program-report-${safeName || (this.programId ?? 'all')}.pdf`);
  }

  onProgramChange(programIdValue: string): void {
    const parsed = this.parseProgramId(programIdValue);
    if (!parsed) return;
    this.setProgramId(parsed);
  }

  private loadProgramsAndDefault(initialProgramId: number | null): void {
    this.isProgramsLoading = true;
    const sub = this.programsService.getCreatedPrograms().subscribe({
      next: (programs) => {
        this.programs = programs || [];
        this.isProgramsLoading = false;

        const defaultId = initialProgramId ?? this.programs[0]?.id ?? null;
        if (defaultId) {
          this.setProgramId(defaultId);
        } else {
          this.programId = null;
          this.selectedProgramId = null;
          this.program = null;
        }
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.errorMessage = 'Failed to load programs. Please try again.';
        this.isProgramsLoading = false;
      }
    });
    this.registerSubscription(sub);
  }

  private setProgramId(programId: number): void {
    this.programId = programId;
    this.selectedProgramId = programId;
    this.loadProgram(programId);
  }

  private loadProgram(programId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    const sub = this.programsService.getProgramById(programId).subscribe({
      next: (program) => {
        this.program = program;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading program:', error);
        this.errorMessage = 'Failed to load program details. Please try again.';
        this.isLoading = false;
      }
    });

    this.registerSubscription(sub);
  }

  private parseProgramId(value: unknown): number | null {
    const n = typeof value === 'string' ? +value : typeof value === 'number' ? value : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }
}

