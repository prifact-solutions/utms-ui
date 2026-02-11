import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent {
  @Input()
  public pdfUrl: string | null = null;

  @Output() onFileCompleted = new EventEmitter<string>();

  public onPdfLoad($event: any) {
    this.onFileCompleted.emit("COMPLETE");
  }
}
