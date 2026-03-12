import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { Program, ProgramSummary } from 'src/app/programs/models/program.model';

type ProgramReportRow = {
  studentName: string;
  email?: string;
  avgScore: number;
  completionPct: number;
  lastActivity: Date;
};

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent extends ComponentBase implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  programsSummary: ProgramSummary[] = [];

  private detailsByProgramId = new Map<number, ProgramReportRow[]>();

  constructor(
    private programsService: ProgramsService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.initialize();
  }

  get totalPrograms(): number {
    return this.programsSummary.length;
  }

  get totalStudentsOverall(): number {
    return this.programsSummary.reduce((acc, r) => acc + r.studentCount, 0);
  }

  get avgCompletionOverallAllPrograms(): number {
    const total = this.totalStudentsOverall;
    if (!total) return 0;
    const weighted = this.programsSummary.reduce((acc, r) => acc + r.avgCompletion * r.studentCount, 0);
    return Math.round((weighted / total) * 10) / 10;
  }

  openProgram(programId: number): void {
    this.router.navigate(['/reports', programId]);
  }

  async exportSummaryPdf(): Promise<void> {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    doc.setFontSize(14);
    doc.text('Programs Report', 40, 40);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

    const head = [[
      'Program',
      'Students',
      'Avg score',
      'Avg completion'
    ]];

    const body = this.programsSummary.map(r => ([
      r.programName,
      `${r.studentCount}`,
      `${Math.round(r.avgScore)}%`,
      `${Math.round(r.avgCompletion)}%`
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
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    doc.save('summary-report.pdf');
  }

  private initialize(): void {
    this.isLoading = true;
    const sub = this.programsService.getSummaryReport().subscribe({
      next: (summaryDetails) => {
        this.programsSummary = summaryDetails || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.errorMessage = 'Failed to load programs. Please try again.';
        this.isLoading = false;
      }
    });
    this.registerSubscription(sub);
  }

  // private getMockDetailsForProgram(programId: number): ProgramReportRow[] {
  //   const existing = this.detailsByProgramId.get(programId);
  //   if (existing) return existing;

  //   const rng = this.makeRng(programId);
  //   const count = 6 + Math.floor(rng() * 12); // 6..17 students
  //   const names = [
  //     'Asha Nair', 'Rahul Menon', 'Divya Krishnan', 'Nikhil George', 'Meera Pillai', 'Arjun Das',
  //     'Lakshmi Kumar', 'Sanjay R', 'Fatima Ali', 'John Mathew', 'Neha Sharma', 'Kiran Rao',
  //     'Priya Iyer', 'Vishal Singh', 'Anu Joseph', 'Rohit Jain', 'Sneha Gupta'
  //   ];

  //   const rows: ProgramReportRow[] = Array.from({ length: count }).map((_, i) => {
  //     const studentName = names[(programId + i) % names.length];
  //     const email = `${studentName.toLowerCase().replace(/[^a-z]+/g, '.')}${(programId + i) % 20}@example.com`;
  //     const avgScore = Math.round(55 + rng() * 45); // 55..100
  //     const completionPct = Math.round(rng() * 100);
  //     const daysAgo = Math.floor(rng() * 30);
  //     const lastActivity = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  //     return { studentName, email, avgScore, completionPct, lastActivity };
  //   });

  //   rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
  //   this.detailsByProgramId.set(programId, rows);
  //   return rows;
  // }

  private makeRng(seed: number): () => number {
    let s = (seed >>> 0) || 1;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
  }
}

