import { Component, OnInit } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { Program } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-program-list',
  templateUrl: './program-list.component.html',
  styleUrls: ['./program-list.component.scss']
})
export class ProgramListComponent extends ComponentBase implements OnInit {
  programs: Program[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private programsService: ProgramsService) {
    super();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const subscription = this.programsService.getCreatedPrograms().subscribe({
      next: (programs) => {
        this.programs = programs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        this.errorMessage = 'Failed to load programs. Please try again.';
        this.isLoading = false;
      }
    });
    this.registerSubscription(subscription);
  }
}
