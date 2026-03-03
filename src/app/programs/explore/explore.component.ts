import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { ProgramsService } from '../services/programs.service';
import { Category, Program } from '../models/program.model';
import { ComponentBase } from "../../common/componentbase";
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { combineLatest, filter, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
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
    private router: Router,
    private route: ActivatedRoute
  ) { super(); }

  @ViewChild('filterList') filterList?: ElementRef;

  public programs: Array<Program> = [];
  public myPrograms: Array<Program> = [];
  public isStaff: boolean = false;
  public isLoading: boolean = true;
  public isAuthenticated: boolean = false;

  public searchTerm: string = '';
  public enrollmentFilter: string = 'all'; // 'all' | 'enrolled' | 'unenrolled'
  public selectedCategories: Set<number> = new Set();

  // Available categories derived from loaded programs
  public categories: Category[] = [];

  get selectedCategoryNames(): string {
    return Array.from(this.selectedCategories)
      .map(id => this.getCategoryLabel(id))
      .filter(name => !!name)
      .join(', ');
  }

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

    let sub1 = combineLatest(this.programsService.getAllPrograms(), this.programsService.getAllCategories())
      .subscribe(([programs, categories]) => {
        this.programs = programs;
        this.isLoading = false;
        this.categories = categories;

        // Only fetch enrolled programs if the user is logged in
        if (this.isAuthenticated) {
          this.loadEnrollmentStatus();
        }

        // Check scroll buttons after DOM update
        setTimeout(() => {
          if (this.filterList) {
            this.checkScroll(this.filterList.nativeElement);
          }
        }, 100);
      });

    // Parse query params (moved to top level to catch updates)
    let subParam = this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm = params['q'];
      }
      if (params['categories']) {
        const catIds = params['categories'].split(',').map((id: string) => parseInt(id.trim())).filter((id: any) => !isNaN(id));
        this.selectedCategories = new Set(catIds);
      }
    });

    this.registerSubscription(sub1);
    this.registerSubscription(subParam);

    if (this.isAuthenticated) {
      try {
        this.isStaff = Utils.decodeAuthToken().is_staff;
      } catch (e) { }
    }
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


  clearAllFilters() {
    this.searchTerm = '';
    this.enrollmentFilter = 'all';
    this.selectedCategories = new Set();
  }

  clearCategories() {
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
  getCategoryLabel(id: number) {
    return this.categories.find(c => c.id === id)?.name;
  }

  // Drag to scroll logic
  private isMouseDown = false;
  private startX = 0;
  private scrollLeft = 0;

  public canScrollLeft = false;
  public canScrollRight = false;

  checkScroll(el: HTMLElement) {
    this.canScrollLeft = el.scrollLeft > 5; // Use a small threshold
    this.canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 5;
  }

  onScroll(el: HTMLElement) {
    this.checkScroll(el);
  }

  scrollAmount(amount: number) {
    if (this.filterList) {
      this.filterList.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }

  startDragging(e: MouseEvent, el: HTMLElement) {
    this.isMouseDown = true;
    el.classList.add('dragging');
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging(el: HTMLElement) {
    this.isMouseDown = false;
    el.classList.remove('dragging');
  }

  moveEvent(e: MouseEvent, el: HTMLElement) {
    if (!this.isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - this.startX) * 2;
    el.scrollLeft = this.scrollLeft - walk;
    this.checkScroll(el);
  }
}
