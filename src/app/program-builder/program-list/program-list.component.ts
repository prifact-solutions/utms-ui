import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { Category, Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { Utils } from 'src/app/common/utils';
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-program-list',
  templateUrl: './program-list.component.html',
  styleUrls: ['./program-list.component.scss']
})
export class ProgramListComponent extends ComponentBase implements OnInit {
  programs: Program[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  categories: Category[] = [];
  isAuthenticated = false;

  @ViewChild('filterList') filterList?: ElementRef;
  public searchTerm: string = '';
  public statusFilter: string = 'all'; // 'all' | 'ACTIVE' | 'DRAFT'
  public selectedCategories: Set<number> = new Set();

  constructor(private programsService: ProgramsService, private authService: AuthService) {
    super();
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isLoading = true;
    this.errorMessage = null;

    const subscription = this.programsService.getCreatedPrograms().subscribe({
      next: (programs) => {
        this.programs = programs;
        this.isLoading = false;

        // Check scroll buttons after DOM update
        setTimeout(() => {
          if (this.filterList) {
            this.checkScroll(this.filterList.nativeElement);
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.errorMessage = 'Failed to load programs. Please try again.';
        this.isLoading = false;
      }
    });
    this.registerSubscription(subscription);

    const catSub = this.programsService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
    this.registerSubscription(catSub);
  }

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

    // Status filter
    if (this.statusFilter !== 'all') {
      result = result.filter(p => p.status === this.statusFilter);
    }

    return result;
  }

  toggleCategory(id: number) {
    if (this.selectedCategories.has(id)) {
      this.selectedCategories.delete(id);
    } else {
      this.selectedCategories.add(id);
    }
    this.selectedCategories = new Set(this.selectedCategories);
  }

  isCategorySelected(id: number): boolean {
    return this.selectedCategories.has(id);
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.selectedCategories = new Set();
  }

  clearCategories() {
    this.selectedCategories = new Set();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm.trim() || this.statusFilter !== 'all' || this.selectedCategories.size > 0);
  }

  getCategoryLabel(id: number) {
    return this.categories.find(c => c.id === id)?.name;
  }

  getProgramInitials(title: string) {
    return Utils.getInitials(title);
  }

  getProgramColor(title: string) {
    return Utils.stringToColor(title);
  }

  // Scroll logic
  public canScrollLeft = false;
  public canScrollRight = false;
  private isMouseDown = false;
  private startX = 0;
  private scrollLeft = 0;

  checkScroll(el: HTMLElement) {
    this.canScrollLeft = el.scrollLeft > 5;
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
