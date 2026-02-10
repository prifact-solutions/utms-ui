import { Component, Input } from '@angular/core';
import { ComponentBase } from '../componentbase';
import { ModuleContentFile } from 'src/app/programs/models/program.model';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent extends ComponentBase {
  @Input()
  public file: ModuleContentFile | null = null;

  public fileUrl: string | null = null;

  @Input()
  public program_id: number = 0;
  @Input()
  public module_id: number = 0;

  constructor(private programService: ProgramsService) { super(); }
  ngOnInit() {
    if (this.file) {
      let sub = this.programService.getLessonFileUrl(this.program_id, this.module_id, this.file?.module_content_id, this.file?.id)
        .subscribe((res) => {
          this.fileUrl = res.file_url;
        });
      this.registerSubscription(sub);
    }
  }
}
