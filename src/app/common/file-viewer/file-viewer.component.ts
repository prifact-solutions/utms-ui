import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ComponentBase } from '../componentbase';
import {
  ModuleContent,
  ModuleContentFile,
} from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FileViewerComponent extends ComponentBase {
  @Input()
  public file: ModuleContentFile | null = null;
  @Output() onNextContentAvailable = new EventEmitter<ModuleContent>();
  public fileUrl: string | null = null;

  @Input()
  public program_id: number = 0;
  @Input()
  public module_id: number = 0;
  errorMessage = '';
  showErrorToast = false;

  constructor(private programService: ProgramsService) {
    super();
  }
  ngOnInit() {
    this.errorMessage = '';
    this.showErrorToast = false;
    if (this.file) {
      let sub = this.programService
        .getLessonFileUrl(
          this.program_id,
          this.module_id,
          this.file?.module_content_id,
          this.file?.id,
        )
        // .subscribe((res) => {
        //   this.fileUrl = res.file_url;
        // });
        .subscribe({
          next: (res) => {
            this.fileUrl = res.file_url;
          },
          error: (err) => {
            this.errorMessage =
              err?.error?.error || err?.message || 'Failed to load content';
            this.triggerErrorToast();
          },
        });
      this.registerSubscription(sub);
    }
  }

  private triggerErrorToast(): void {
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
      this.errorMessage = '';
    }, 5000);
  }

  onFileCompleted(status: string) {
    if (this.file) {
      let sub = this.programService
        .updateFileStatus(
          this.program_id,
          this.module_id,
          this.file?.module_content_id,
          this.file?.id,
          status,
        )
        .subscribe((res) => {
          if (res) {
            this.onNextContentAvailable.emit(res);
          }
        });
      this.registerSubscription(sub);
    }
  }
}
