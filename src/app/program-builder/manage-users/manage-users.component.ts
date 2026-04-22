import { Component } from '@angular/core';
import { finalize, switchMap } from 'rxjs';
import { ComponentBase } from 'src/app/common/componentbase';
import { UserModel } from 'src/app/users/models/user.model';
import { UsersService } from 'src/app/users/services/users.service';
import { AuthService } from 'src/app/utms-auth/services/auth.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
})
export class ManageUsersComponent extends ComponentBase {
  inviteSuccessMessage = '';

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    super();
  }
  showInviteModal = false;
  inviteEmail = '';
  inviteFirstName = '';
  inviteLastName = '';
  inviteRole: 'student' | 'staff' = 'student';
  inviteStatusMessage = '';
  inviteStatusType: 'success' | 'error' | '' = '';
  isInviting = false;
  showInviteSuccessPopup = false;
  /** After focus out (blur), show inline validation when invalid */
  inviteFirstNameBlurred = false;
  inviteEmailBlurred = false;

  readonly roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'staff', label: 'Instructor' },
  ] as const;

  users: UserModel[] = [];
  usersLoading = true;

  showEditUserModal = false;
  editingUser: UserModel | null = null;
  editFirstName = '';
  editLastName = '';
  editRole: 'student' | 'staff' = 'student';
  editStatusMessage = '';
  editStatusType: 'success' | 'error' | '' = '';
  isSavingUser = false;
  editFirstNameBlurred = false;

  showDeleteConfirm = false;
  userPendingDelete: UserModel | null = null;
  isDeletingUser = false;
  deleteErrorMessage = '';

  ngOnInit() {
    const sub = this.usersService
      .getAllUsers()
      .pipe(finalize(() => (this.usersLoading = false)))
      .subscribe((users) => {
        this.users = users;
      });
    this.registerSubscription(sub);
  }
  openInviteModal(): void {
    this.showInviteModal = true;
    this.inviteStatusMessage = '';
    this.inviteStatusType = '';
    this.inviteFirstNameBlurred = false;
    this.inviteEmailBlurred = false;
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.inviteEmail = '';
    this.inviteFirstName = '';
    this.inviteLastName = '';
    this.inviteRole = 'student';
    this.inviteStatusMessage = '';
    this.inviteStatusType = '';
    this.inviteFirstNameBlurred = false;
    this.inviteEmailBlurred = false;
  }

  onInviteFirstNameFocus(): void {
    this.inviteFirstNameBlurred = false;
  }

  onInviteFirstNameBlur(): void {
    this.inviteFirstNameBlurred = true;
  }

  onInviteEmailFocus(): void {
    this.inviteEmailBlurred = false;
  }

  onInviteEmailBlur(): void {
    this.inviteEmailBlurred = true;
  }

  closeInviteSuccessPopup(): void {
    this.showInviteSuccessPopup = false;
    this.inviteSuccessMessage = '';
  }

  get isInviteEmailValid(): boolean {
    if (!this.inviteEmail) {
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.inviteEmail.trim());
  }

  onInvite(): void {
    this.inviteStatusMessage = '';
    this.inviteStatusType = '';
    if (
      !this.inviteFirstName.trim() ||
      !this.inviteEmail.trim() ||
      !this.isInviteEmailValid
    ) {
      return;
    }
    this.isInviting = true;
    const isStaffAccount = this.inviteRole === 'staff';
    const invitePayload = {
      firstName: this.inviteFirstName.trim(),
      lastName: this.inviteLastName.trim(),
      email: this.inviteEmail.trim(),
    };
    this.authService
      .sendInvite(
        invitePayload.email,
        isStaffAccount,
        invitePayload.firstName,
        invitePayload.lastName,
      )
      .pipe(
        switchMap((_) => {
          return this.usersService.getAllUsers();
        }),
      )
      .subscribe({
        next: (users) => {
          this.users = users;
          const displayName = [invitePayload.firstName, invitePayload.lastName]
            .filter((p) => p.length > 0)
            .join(' ');
          this.inviteSuccessMessage = `An invite mail has been sent to ${displayName} at ${invitePayload.email}`;
          this.showInviteSuccessPopup = true;
          this.inviteStatusType = 'success';
          this.inviteStatusMessage = 'Invitation sent successfully.';
          this.showInviteModal = false;
          this.inviteFirstNameBlurred = false;
          this.inviteEmailBlurred = false;
          this.inviteEmail = '';
          this.inviteFirstName = '';
          this.inviteLastName = '';
          this.inviteRole = 'student';
          this.isInviting = false;
        },
        error: (err) => {
          this.inviteStatusType = 'error';
          if (err.status === 409) {
            this.inviteStatusMessage = err.error.message;
          } else {
            this.inviteStatusMessage = 'An unexpected error occurred.';
          }
          this.isInviting = false;
        },
      });
  }

  getAvatarText(user: UserModel) {
    let initials = '';
    if (user.first_name) {
      initials += user.first_name[0].toUpperCase();
    }
    if (user.last_name) {
      initials += user.last_name[0].toUpperCase();
    }
    return initials;
  }

  getRoleLabel(user: UserModel) {
    if (user.is_staff) {
      return 'Instructor';
    } else {
      return 'Student';
    }
  }

  getStatusLabel(user: UserModel) {
    if (user.is_active) {
      return 'Active';
    } else {
      return 'Inactive';
    }
  }

  getUserName(user: UserModel) {
    let name = user.first_name;
    if (user.last_name) {
      name += ' ' + user.last_name;
    }

    return name;
  }

  onEditUser(user: UserModel): void {
    this.editingUser = user;
    this.editFirstName = user.first_name?.trim() ?? '';
    this.editLastName = user.last_name?.trim() ?? '';
    this.editRole = user.is_staff ? 'staff' : 'student';
    this.editStatusMessage = '';
    this.editStatusType = '';
    this.editFirstNameBlurred = false;
    this.showEditUserModal = true;
  }

  closeEditUserModal(): void {
    this.showEditUserModal = false;
    this.editingUser = null;
    this.editFirstName = '';
    this.editLastName = '';
    this.editRole = 'student';
    this.editStatusMessage = '';
    this.editStatusType = '';
    this.editFirstNameBlurred = false;
  }

  onEditFirstNameFocus(): void {
    this.editFirstNameBlurred = false;
  }

  onEditFirstNameBlur(): void {
    this.editFirstNameBlurred = true;
  }

  onSaveUser(): void {
    this.editStatusMessage = '';
    this.editStatusType = '';
    if (!this.editingUser) {
      return;
    }
    if (!this.editFirstName.trim()) {
      this.editFirstNameBlurred = true;
      return;
    }
    this.isSavingUser = true;
    const payload = {
      first_name: this.editFirstName.trim(),
      last_name: this.editLastName.trim(),
      is_staff: this.editRole === 'staff',
    };
    this.usersService
      .updateUser(this.editingUser.id, payload)
      .pipe(
        switchMap(() => this.usersService.getAllUsers()),
        finalize(() => (this.isSavingUser = false)),
      )
      .subscribe({
        next: (users) => {
          this.users = users;
          this.closeEditUserModal();
        },
        error: () => {
          this.editStatusType = 'error';
          this.editStatusMessage = 'Could not save changes. Please try again.';
        },
      });
  }

  onDeleteUser(user: UserModel): void {
    this.userPendingDelete = user;
    this.deleteErrorMessage = '';
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.userPendingDelete = null;
    this.deleteErrorMessage = '';
  }

  confirmDeleteUser(): void {
    if (!this.userPendingDelete) {
      return;
    }
    this.isDeletingUser = true;
    this.deleteErrorMessage = '';
    this.usersService
      .deleteUser(this.userPendingDelete.id)
      .pipe(
        switchMap(() => this.usersService.getAllUsers()),
        finalize(() => (this.isDeletingUser = false)),
      )
      .subscribe({
        next: (users) => {
          this.users = users;
          this.closeDeleteConfirm();
        },
        error: () => {
          this.deleteErrorMessage =
            'Could not delete this user. Please try again.';
        },
      });
  }
}
