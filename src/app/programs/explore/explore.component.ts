import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ProgramsService } from '../services/programs.service';
import { Program } from '../models/program.model';
import { ComponentBase } from "../../common/componentbase";
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { filter, switchMap } from 'rxjs';
import { Utils } from "../../common/utils";

export interface CategoryOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExploreComponent extends ComponentBase implements OnInit {

  constructor(
    private programsService: ProgramsService,
    private authService: AuthService,
    private router: Router
  ) { super(); }

  public programs: Array<Program> = [];
  public myPrograms: Array<Program> = [];
  public isStaff: boolean = false;
  public isLoading: boolean = true;
  public isAuthenticated: boolean = false;

  public searchTerm: string = '';
  public enrollmentFilter: string = 'all'; // 'all' | 'enrolled' | 'unenrolled'
  public selectedCategories: Set<number> = new Set();

  // Available categories derived from loaded programs
  public availableCategories: CategoryOption[] = [];

  // Static label map — extend as your backend category IDs grow
  private readonly CATEGORY_LABELS: Record<number, string> = {
    1: 'Technology',
    2: 'Business',
    3: 'Design',
    4: 'Marketing',
    5: 'Data Science',
    6: 'Personal Development',
    7: 'Finance',
    8: 'Health & Wellness',
    9: 'Language',
    10: 'Engineering',
  };

  get filteredPrograms(): Array<Program> {
    let result = this.programs;

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.short_description && p.short_description.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (this.selectedCategories.size > 0) {
      result = result.filter(p =>
        p.categories && p.categories.some(c => this.selectedCategories.has(c))
      );
    }

    // Enrollment filter
    if (this.enrollmentFilter !== 'all' && this.isAuthenticated) {
      if (this.enrollmentFilter === 'enrolled') {
        result = result.filter(p => p.is_enrolled);
      } else if (this.enrollmentFilter === 'unenrolled') {
        result = result.filter(p => !p.is_enrolled);
      }
    }

    return result;
  }

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();

    let sub1 = this.programsService.getAllPrograms()
      .subscribe(programs => {
        this.programs = programs;
        this.isLoading = false;
        this.buildCategoryOptions();

        // Only fetch enrolled programs if the user is logged in
        if (this.isAuthenticated) {
          this.loadEnrollmentStatus();
        }
      });
    this.registerSubscription(sub1);

    if (this.isAuthenticated) {
      try {
        this.isStaff = Utils.decodeAuthToken().is_staff;
      } catch (e) { }
    }
  }

  private buildCategoryOptions() {
    // Gather all unique category IDs from the programs list
    const idSet = new Set<number>();
    this.programs.forEach(p => (p.categories || []).forEach(c => idSet.add(c)));

    this.availableCategories = Array.from(idSet)
      .sort((a, b) => a - b)
      .map(id => ({
        id,
        label: this.CATEGORY_LABELS[id] || `Category ${id}`
      }));
  }

  toggleCategory(id: number) {
    if (this.selectedCategories.has(id)) {
      this.selectedCategories.delete(id);
    } else {
      this.selectedCategories.add(id);
    }
    // Trigger change detection on a Set mutation
    this.selectedCategories = new Set(this.selectedCategories);
  }

  isCategorySelected(id: number): boolean {
    return this.selectedCategories.has(id);
  }

  getCategoryLabel(id: number): string {
    return this.CATEGORY_LABELS[id] || `Category ${id}`;
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.enrollmentFilter = 'all';
    this.selectedCategories = new Set();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm.trim() || this.enrollmentFilter !== 'all' || this.selectedCategories.size > 0);
  }

  private loadEnrollmentStatus() {
    let sub2 = this.authService.currentUser$
      .pipe(
        filter(user => user != null),
        switchMap(() => this.programsService.getMyPrograms())
      )
      .subscribe(myPrograms => {
        this.myPrograms = myPrograms;
        this.programs.forEach(program => {
          program.is_enrolled = !!myPrograms.find(o => o.id === program.id);
        });
      });
    this.registerSubscription(sub2);
  }

  clickProgram(program: Program) {
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/programs/${program.id}/details` } });
    } else {
      this.router.navigate([`/programs/${program.id}/details`]);
    }
  }

  enrollProgram(event: Event, programId: number) {
    event.stopPropagation();
    this.router.navigate([`/programs/${programId}/enroll`]);
  }

  viewProgram(event: Event, programId: number) {
    event.stopPropagation();
    this.router.navigate([`/programs/${programId}/details`]);
  }
}
