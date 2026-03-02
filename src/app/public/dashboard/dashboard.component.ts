import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProgramsService } from 'src/app/programs/services/programs.service';
import { Program } from 'src/app/programs/models/program.model';
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

    getCategoryLabel(id: number): string {
        return this.CATEGORY_LABELS[id] || `Category ${id}`;
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
