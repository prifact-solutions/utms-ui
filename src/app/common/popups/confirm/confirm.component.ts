import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
})
export class ConfirmComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() message = '';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmLabel = 'Yes';
  @Input() busy = false;
  @Input() showBusyOverlay = false;
  @Input() toolbarButtons = true;
  @Input() useShadow = false;
  @Input() flushHeader = false;
  @Input() paddedInner = false;
  @Input() noteBodyPadding = false;
  @Input() maxWidth: string | null = null;
  @Input() topAlert: string | null = null;
  @Input() errorMessage = '';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onOverlayClick(): void {
    if (this.busy) {
      return;
    }
    this.cancel.emit();
  }

  onCancel(): void {
    if (this.busy) {
      return;
    }
    this.cancel.emit();
  }

  onConfirm(): void {
    if (this.busy) {
      return;
    }
    this.confirm.emit();
  }
}
