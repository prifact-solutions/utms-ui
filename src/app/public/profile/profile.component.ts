import { Component, OnInit } from '@angular/core';
import { ComponentBase } from 'src/app/common/componentbase';
import { Utils } from 'src/app/common/utils';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends ComponentBase implements OnInit {
  public username: string = 'User';
  public email: string = '';
  public role: string = '';
  public dateJoined: string = '';
  public initials: string = 'U';
  public profileColor: string = '#ccc';
  //public isStaff: boolean = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    try {
      const decoded = Utils.decodeAuthToken();
      if (decoded.username) {
        this.username = decoded.username.charAt(0).toUpperCase() + decoded.username.slice(1);
      } else if (decoded.name) {
        this.username = decoded.name;
      }

      this.email = decoded.email || 'N/A';
      this.dateJoined = decoded.date_joined;
      //this.isStaff = !!decoded.is_staff;
      this.role = Utils.getRoleLabel();
      this.initials = Utils.getInitials(this.username);
      this.profileColor = Utils.stringToColor(this.username);
    } catch (e) {
      console.error('Error decoding profile info', e);
    }
  }
}
