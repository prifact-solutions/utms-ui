import { Component } from '@angular/core';
import { switchMap } from 'rxjs';
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

  ngOnInit() {
    var sub = this.usersService.getAllUsers().subscribe((users) => {
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
            this.inviteStatusMessage = 'A user with this email already exists.';
          } else {
            this.inviteStatusMessage =
              'An unexpected error occurred.';
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
      return 'Learner';
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
}
