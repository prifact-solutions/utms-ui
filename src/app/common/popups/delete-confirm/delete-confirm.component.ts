import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-confirm',
  templateUrl: './delete-confirm.component.html',
  styleUrls: ['./delete-confirm.component.scss'],
})
export class DeleteConfirmComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() itemName = '';
  /** When set, replaces the default message line (plain text). */
  @Input() messageOverride: string | null = null;
  /** Text before the emphasized item name (ignored when messageOverride is set). */
  @Input() messageLead = 'Are you sure you want to delete ';
  /** Optional trailing detail after the name, e.g. email in parentheses (no leading space). */
  @Input() itemDetail: string | null = null;
  @Input() showTrashIcon = false;
  @Input() showQuotesAroundItem = false;
  @Input() deleteErrorMessage = '';
  @Input() busy = false;
  @Input() showBusyOverlay = false;
  /** true: btn-outline + btn-danger; false: .button + primaryDeleteClass */
  @Input() toolbarButtons = true;
  @Input() useShadow = false;
  @Input() flushHeader = false;
  /** When true, modal-body is p-0 and message sits in an inner padded, centered block. */
  @Input() paddedInner = false;
  /** Applies note-delete-modal body padding when true. */
  @Input() noteBodyPadding = false;
  @Input() maxWidth: string | null = null;
  /** Class on the primary delete button when toolbarButtons is false (e.g. note-delete-btn, delete-btn). */
  @Input() primaryDeleteClass = 'note-delete-btn';
  /** Use invite-actions row (e.g. manage users delete). */
  @Input() useInviteActionRow = false;
  @Input() userDeleteActions = false;
  /** Optional alert above body (e.g. notes API error). */
  @Input() topAlert: string | null = null;
  /** Apply manage-users delete overlay/modal classes. */
  @Input() userDeleteOverlay = false;

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
