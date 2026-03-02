import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { Category, Program } from 'src/app/programs/models/program.model';
import { ComponentBase } from 'src/app/common/componentbase';
import { Utils } from 'src/app/common/utils';
import { RecentProgramsService, RecentProgram } from 'src/app/common/recent-programs.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends ComponentBase implements OnInit {

    public enrolledPrograms: Array<Program> = [];
    public recentPrograms: Array<RecentProgram> = [];
    public isLoadingEnrolled: boolean = true;
    public username: string = 'there';
    public categories: Array<Category> = [];

    getCategoryLabel(id: number) {
        return this.categories.find(c => c.id === id)?.name;
    }

    constructor(
        private programsService: ProgramsService,
        private recentProgramsService: RecentProgramsService,
        private router: Router
    ) {
        super();
    }

    ngOnInit() {
        // Decode username from JWT
        try {
            const decoded = Utils.decodeAuthToken();
            if (decoded.username) {
                // Capitalize first letter
                this.username = decoded.username.charAt(0).toUpperCase() + decoded.username.slice(1);
            } else if (decoded.name) {
                this.username = decoded.name;
            }
        } catch (e) { }

        // Load enrolled programs
        const sub = this.programsService.getMyPrograms().subscribe(programs => {
            this.enrolledPrograms = programs;
            this.isLoadingEnrolled = false;
        });
        this.registerSubscription(sub);

        // Load recent programs from localStorage
        this.recentPrograms = this.recentProgramsService.getRecentPrograms();

        this.programsService.getAllCategories().subscribe(categories => {
            this.categories = categories;
        });
    }

    goToProgram(programId: number) {
        this.router.navigate([`/programs/${programId}/details`]);
    }

    goToExplore() {
        this.router.navigate(['/explore']);
    }

    getTimeAgo(timestamp: number): string {
        const diffMs = Date.now() - timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    }
}
