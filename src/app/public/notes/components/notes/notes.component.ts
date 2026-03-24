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
  constructor(private notesService: NotesService) {
    super();
  }
  ngOnInit() {
    this.notesService.getNotesForUser().subscribe((notes) => {
      this.notes = notes;
      // var note: Note = {
      //   id: 1,
      //   title: 'Initial Thoughts on Project Management',
      //   content:
      //     'This page is currently under development. Soon youll be able to save highlights and personal notes from your courses here.',
      //   updated_at: 'March 12, 2026',
      // };
      // this.notes.push(note);
      // this.notes.push(note);
    });
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

    this.notesService
      .deleteNote(this.notePendingDelete.id)
      .pipe(
        switchMap((_) => {
          return this.notesService.getNotesForUser();
        }),
      )
      .subscribe((notes) => {
        this.notes = notes;
        this.closeDeleteConfirm();
      });
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

    if (this.editingNoteId !== null) {
      // this.notes[this.editingNoteIndex] = {
      //   ...this.notes[this.editingNoteIndex],
      //   title: trimmedTitle,
      //   content: trimmedContent,
      //   updated_at: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      // };
      this.notesService
        .updateNote(this.editingNoteId, trimmedTitle, trimmedContent)
        .pipe(
          switchMap((_) => {
            return this.notesService.getNotesForUser();
          }),
        )
        .subscribe((notes) => {
          this.notes = notes;
        });
    } else {
      // this.notes.unshift({
      //   title: trimmedTitle,
      //   content: trimmedContent,
      //   updated_at: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      // });
      this.notesService
        .createNote(trimmedTitle, trimmedContent)
        .pipe(
          switchMap((_) => {
            return this.notesService.getNotesForUser();
          }),
        )
        .subscribe((notes) => {
          this.notes = notes;
        });
    }

    this.closeNotePopup();
  }

  get isEditingNote(): boolean {
    return this.editingNoteId !== null;
  }
}
