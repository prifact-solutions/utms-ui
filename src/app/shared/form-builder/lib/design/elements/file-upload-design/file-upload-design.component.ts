import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { FileUploadElement } from '../../../model/form-elements';

@Component({
  selector: 'app-file-upload-design',
  templateUrl: './file-upload-design.component.html',
  styleUrls: ['./file-upload-design.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FileUploadDesignComponent implements OnInit {

  constructor() { }

  @Input()
  item: FileUploadElement;

  ngOnInit() {
  }

}
