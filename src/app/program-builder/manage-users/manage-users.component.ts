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
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.inviteEmail = '';
    this.inviteFirstName = '';
    this.inviteLastName = '';
    this.inviteRole = 'student';
    this.inviteStatusMessage = '';
    this.inviteStatusType = '';
  }

  get isInviteEmailValid(): boolean {
    if (!this.inviteEmail) {
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(this.inviteEmail);
  }

  onInvite(): void {
    this.inviteStatusMessage = '';
    this.inviteStatusType = '';
    this.isInviting = true;
    const isStaffAccount = this.inviteRole === 'staff';
    this.authService
      .sendInvite(
        this.inviteEmail,
        isStaffAccount,
        this.inviteFirstName,
        this.inviteLastName,
      )
      .pipe(
        switchMap((_) => {
          return this.usersService.getAllUsers();
        }),
      )
      .subscribe({
        next: (users) => {
          this.users = users;
          this.inviteStatusType = 'success';
          this.inviteStatusMessage = 'Invitation sent successfully.';
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
