import { AngularEditorConfig } from '@kolkov/angular-editor';



export const globalEditorConfig:AngularEditorConfig = {
  editable: true,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      {class: 'arial', name: 'Arial'},
      {class: 'times-new-roman', name: 'Times New Roman'},
      {class: 'calibri', name: 'Calibri'},
      {class: 'comic-sans-ms', name: 'Comic Sans MS'}
    ],
  sanitize: true,
  toolbarPosition: 'top',

  toolbarHiddenButtons: [
    [
      'undo',
      'redo',
      'underline',
      'strikeThrough',
      'subscript',
      'superscript',
      'justifyLeft',
      'justifyCenter',
      'justifyRight',
      'justifyFull',
      'heading',
      'fontName'
    ],
    [
      
      'textColor',
      'backgroundColor',
      'customClasses',
      'link',
      'unlink',
      'insertVideo',
      'insertHorizontalRule',
      'removeFormat',
      /*'toggleEditorMode'*/
    ]
  ]
  
};



