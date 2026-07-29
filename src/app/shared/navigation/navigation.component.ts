import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { Utils } from 'src/app/common/utils';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { Category } from 'src/app/programs/models/program.model';
import { TenantInfoService } from 'src/app/common/services/tenant-info.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavigationComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isStaff = false;
  isAdmin = false;
  private authSubscription: Subscription | null = null;

  userName = '';
  userEmail = '';

  public showFilter: boolean = false;
  public searchTerm: string = '';
  public categories: Array<Category> = [];
  public selectedCategories: Set<number> = new Set<number>();
  @ViewChild('searchContainer') searchContainer!: ElementRef;

  get appLogoPath(): string {
    return this.tenantInfo.appLogo;
  }
  get showDemoFeatures(): boolean {
    return this.tenantInfo.showDemoFeatures;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private programsService: ProgramsService,
    private tenantInfo: TenantInfoService,
  ) {}

  ngOnInit(): void {
    this.updateAuthStatus();
    this.authSubscription = this.authService.currentUser$.subscribe(() => {
      this.updateAuthStatus();
    });

    this.programsService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let activeRoute = this.route.root;
        while (activeRoute.firstChild) {
          activeRoute = activeRoute.firstChild;
        }
        const programId = activeRoute.snapshot.paramMap.get('program_id');
        if (programId) {
          this.programsService.setProgramId(programId);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      const tokenData = Utils.decodeAuthToken();
      this.isStaff = Utils.isStaff() || false;
      this.isAdmin = Utils.isAdmin() || false;
      this.userName = tokenData.name || 'User';
      this.userEmail = tokenData.email || '';
    } else {
      this.isStaff = false;
      this.userName = '';
      this.userEmail = '';
    }
  }

  getUserInitials(): string {
    if (!this.userName) return 'U';
    return this.userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout(): void {
    // this.authService.logout();
    // this.router.navigate(['/']);
    this.authService.keycloakLogout();
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
        },
      });
      this.showFilter = false;
    }
  }

  onFocus() {
    this.showFilter = true;
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.showFilter &&
      this.searchContainer &&
      !this.searchContainer.nativeElement.contains(event.target)
    ) {
      this.showFilter = false;
    }
  }

  tooltipVisible = false;
  tooltipText = '';

  tooltipX = 0;
  tooltipY = 0;

  showTooltip(event: MouseEvent, text: string) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.tooltipText = text;

    this.tooltipX = rect.right + 12;

    this.tooltipY = rect.top + rect.height / 2;

    this.tooltipVisible = true;
  }

  hideTooltip() {
    this.tooltipVisible = false;
  }
}
