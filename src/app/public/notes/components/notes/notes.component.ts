import { Component } from '@angular/core';
import { Note } from '../../models/note.model';
import { ComponentBase } from 'src/app/common/componentbase';
import { NotesService } from '../../services/notes.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent extends ComponentBase {
  isNotePopupOpen = false;
  isViewNotePopupOpen = false;
  isDeleteConfirmOpen = false;
  noteTitle = '';
  noteContent = '';
  editingNoteId: number | null = null;
  selectedNote: Note | null = null;
  notePendingDelete: Note | null = null;
  notes: Note[] = [];
  notesLoading = true;

  constructor(private notesService: NotesService) {
    super();
  }

  ngOnInit() {
    this.notesLoading = true;
    const sub = this.notesService.getNotesForUser().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.notesLoading = false;
      },
      error: () => {
        this.notesLoading = false;
      },
    });
    this.registerSubscription(sub);
  }

  openNotePopup(): void {
    this.isViewNotePopupOpen = false;
    this.selectedNote = null;
    this.editingNoteId = null;
    this.noteTitle = '';
    this.noteContent = '';
    this.isNotePopupOpen = true;
  }

  viewNote(note: Note): void {
    this.selectedNote = note;
    this.isViewNotePopupOpen = true;
  }

  editNote(note: Note): void {
    this.isViewNotePopupOpen = false;
    this.selectedNote = null;
    this.editingNoteId = note.id;
    this.noteTitle = note.title;
    this.noteContent = note.content;
    this.isNotePopupOpen = true;
  }

  openDeleteConfirm(note: Note, event: Event): void {
    event.stopPropagation();
    this.notePendingDelete = note;
    this.isDeleteConfirmOpen = true;
  }

  closeDeleteConfirm(): void {
    this.isDeleteConfirmOpen = false;
    this.notePendingDelete = null;
  }

  confirmDeleteNote(): void {
    if (!this.notePendingDelete?.id) {
      this.closeDeleteConfirm();
      return;
    }

    if (this.selectedNote?.id === this.notePendingDelete.id) {
      this.closeViewNotePopup();
    }

    this.notesLoading = true;
    const sub = this.notesService
      .deleteNote(this.notePendingDelete.id)
      .pipe(
        switchMap((_) => {
          return this.notesService.getNotesForUser();
        }),
      )
      .subscribe({
        next: (notes) => {
          this.notes = notes;
          this.notesLoading = false;
          this.closeDeleteConfirm();
        },
        error: () => {
          this.notesLoading = false;
        },
      });
    this.registerSubscription(sub);
  }

  closeNotePopup(): void {
    this.isNotePopupOpen = false;
    this.editingNoteId = null;
    this.noteTitle = '';
    this.noteContent = '';
  }

  closeViewNotePopup(): void {
    this.isViewNotePopupOpen = false;
    this.selectedNote = null;
  }

  saveNote(): void {
    const trimmedTitle = this.noteTitle.trim();
    const trimmedContent = this.noteContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      return;
    }

    this.notesLoading = true;

    if (this.editingNoteId !== null) {
      const sub = this.notesService
        .updateNote(this.editingNoteId, trimmedTitle, trimmedContent)
        .pipe(
          switchMap((_) => {
            return this.notesService.getNotesForUser();
          }),
        )
        .subscribe({
          next: (notes) => {
            this.notes = notes;
            this.notesLoading = false;
            this.closeNotePopup();
          },
          error: () => {
            this.notesLoading = false;
          },
        });
      this.registerSubscription(sub);
    } else {
      const sub = this.notesService
        .createNote(trimmedTitle, trimmedContent)
        .pipe(
          switchMap((_) => {
            return this.notesService.getNotesForUser();
          }),
        )
        .subscribe({
          next: (notes) => {
            this.notes = notes;
            this.notesLoading = false;
            this.closeNotePopup();
          },
          error: () => {
            this.notesLoading = false;
          },
        });
      this.registerSubscription(sub);
    }
  }

  get isEditingNote(): boolean {
    return this.editingNoteId !== null;
  }
}
