import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, Renderer2, Inject, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { Category, Program } from 'src/app/programs/models/program.model';
import { ComponentBase } from 'src/app/common/componentbase';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LandingComponent extends ComponentBase implements OnInit, OnDestroy {

  public programs: Array<Program> = [];
  public isLoading: boolean = true;
  public showFilter: boolean = false;
  public searchTerm: string = '';
  public categories: Array<Category> = [];
  public selectedCategories: Set<number> = new Set<number>();
  @ViewChild('searchContainer') searchContainer!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private programsService: ProgramsService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    super();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/explore']);
      return;
    }

    let sub = this.programsService.getAllPrograms()
      .subscribe(programs => {
        this.programs = programs;
        this.isLoading = false;
      });
    this.registerSubscription(sub);
    this.programsService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
    this.renderer.addClass(this.document.body, 'home-showing');
  }

  get filteredPrograms(): Program[] {
    let filtered = this.programs;

    if (this.selectedCategories.size > 0) {
      filtered = filtered.filter(p =>
        p.categories && p.categories.some(catId => this.selectedCategories.has(catId))
      );
    }

    return filtered;
  }

  toggleCategory(categoryId: number) {
    if (this.selectedCategories.has(categoryId)) {
      this.selectedCategories.delete(categoryId);
    } else {
      this.selectedCategories.add(categoryId);
    }
  }

  clearCategories() {
    this.selectedCategories.clear();
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategories.size === 0 || this.selectedCategories.has(categoryId);
  }

  getCategoryLabel(id: number) {
    return this.categories.find(c => c.id === id)?.name;
  }

  override ngOnDestroy() {
    this.renderer.removeClass(this.document.body, 'home-showing');
    super.ngOnDestroy();
  }

  onSearchInput() {
    this.showFilter = true;
  }

  onSearch() {
    if (this.searchTerm.trim() || this.selectedCategories.size > 0) {
      const categories = Array.from(this.selectedCategories).join(',');
      this.router.navigate(['/explore'], {
        queryParams: {
          q: this.searchTerm.trim() || null,
          categories: categories || null,
          view: 'table'
        }
      });
    }
  }

  onFocus() {
    this.showFilter = true;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.showFilter && this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
      this.showFilter = false;
    }
  }

  enrollProgram(programId: number) {
    this.router.navigate(['/login'], { queryParams: { returnUrl: `/programs/${programId}/enroll` } });
  }

  viewProgram(programId: number) {
    this.router.navigate(['/login'], { queryParams: { returnUrl: `/programs/${programId}/details` } });
  }

}
