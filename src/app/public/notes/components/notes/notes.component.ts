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
  private readonly noteDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

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
  errorMessage = '';

  constructor(private notesService: NotesService) {
    super();
  }

  ngOnInit() {
    this.notesLoading = true;
    const sub = this.notesService.getNotesForUser().subscribe({
      next: (notes) => {
        this.notes = this.sortNotesByUpdatedAt(notes);
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
    this.errorMessage = '';
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
    this.errorMessage = '';
    this.isNotePopupOpen = true;
  }

  openDeleteConfirm(note: Note, event: Event): void {
    event.stopPropagation();
    this.errorMessage = '';
    this.notePendingDelete = note;
    this.isDeleteConfirmOpen = true;
  }

  closeDeleteConfirm(): void {
    this.errorMessage = '';
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
          this.errorMessage = '';
          this.notes = this.sortNotesByUpdatedAt(notes);
          this.notesLoading = false;
          this.closeDeleteConfirm();
        },
        error: (err) => {
          this.errorMessage = err?.error?.error || 'Failed to delete note';
          this.notesLoading = false;
        },
      });
    this.registerSubscription(sub);
  }

  closeNotePopup(): void {
    this.errorMessage = '';
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
            this.errorMessage = '';
            this.notes = this.sortNotesByUpdatedAt(notes);
            this.notesLoading = false;
            this.closeNotePopup();
          },
          error: (err) => {
            this.errorMessage = err?.error?.error || 'Failed to update note';
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
            this.errorMessage = '';
            this.notes = this.sortNotesByUpdatedAt(notes);
            this.notesLoading = false;
            this.closeNotePopup();
          },
          error: (err) => {
            this.errorMessage = err?.error?.error || 'Failed to create note';
            this.notesLoading = false;
          },
        });
      this.registerSubscription(sub);
    }
  }

  get isEditingNote(): boolean {
    return this.editingNoteId !== null;
  }

  private sortNotesByUpdatedAt(notes: Note[]): Note[] {
    return [...notes].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  }

  formatUpdatedAt(updatedAt: string): string {
    const parsedDate = new Date(updatedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return updatedAt;
    }

    return this.noteDateFormatter.format(parsedDate);
  }
}
