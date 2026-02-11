import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentBase } from '../../componentbase';

@Component({
  selector: 'app-img-viewer',
  templateUrl: './img-viewer.component.html',
  styleUrls: ['./img-viewer.component.scss']
})
export class ImgViewerComponent extends ComponentBase {
  @Input()
  public imageUrl: string | null = null;

  @Input()
  public fileName: string | null = null;

  @Output() onFileCompleted = new EventEmitter<string>();

  public onImageOpened($event: any) {
    this.onFileCompleted.emit("COMPLETED");
  }
}
