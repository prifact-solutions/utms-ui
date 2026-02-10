import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileViewerComponent } from './file-viewer.component';
import { ImgViewerComponent } from './img-viewer/img-viewer.component';
import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { HtmlViewerComponent } from './html-viewer/html-viewer.component';
import { GenericFileComponent } from './generic-file/generic-file.component';



@NgModule({
  declarations: [VideoPlayerComponent,
    PdfViewerComponent,
    ImgViewerComponent,
    FileViewerComponent,
    HtmlViewerComponent,
    GenericFileComponent],
  imports: [
    CommonModule
  ],
  exports:[FileViewerComponent]
})
export class FileViewerModule { }
