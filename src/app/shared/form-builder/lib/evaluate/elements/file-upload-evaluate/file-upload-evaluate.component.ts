import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { FileUploadElement } from '../../../model/form-elements';
import { FileUploadAnswer } from '../../../model/context';
import { FormEvaluateService } from '../../services/form-evaluate.service';

@Component({
  selector: 'app-file-upload-evaluate',
  templateUrl: './file-upload-evaluate.component.html',
  styleUrls: ['./file-upload-evaluate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FileUploadEvaluateComponent implements OnInit {

  constructor(private formEvalSvc: FormEvaluateService) { }
  @Input()
  item: FileUploadElement;

  get answer(): FileUploadAnswer {

    let ans = this.formEvalSvc.getAnswerFor(this.item);

    if (ans == null)
      return null;

    if (ans instanceof FileUploadAnswer)
      return ans;

    throw new Error("Incorrect instance type - expected FileUploadAnswer - Found-> " + ans.elementType)
  }


  ngOnInit() {
  }

}
