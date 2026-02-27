import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent {
  @Input()
  public pdfUrl: string | null = null;
  public pdfUrlSanitized: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.pdfUrl) {
      this.pdfUrlSanitized = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl);
    }
  }

  @Output() onFileCompleted = new EventEmitter<string>();

  public onPdfLoad($event: any) {
    this.onFileCompleted.emit("COMPLETE");
  }
}
