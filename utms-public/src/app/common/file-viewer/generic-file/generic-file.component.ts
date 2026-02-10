import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-generic-file',
  templateUrl: './generic-file.component.html',
  styleUrls: ['./generic-file.component.scss']
})
export class GenericFileComponent {
  @Input()
  public fileUrl: string | null = null;

  @Input()
  public fileName: string | null = null;

  @Output() onFileCompleted = new EventEmitter<string>();

  public onPdfLoad($event: any) {
    this.onFileCompleted.emit("COMPLETE");
  }
}
