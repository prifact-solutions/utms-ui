import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dot-menu',
  templateUrl: './dot-menu.component.html',
  styleUrls: ['./dot-menu.component.scss'],
})
export class DotMenuComponent {
  constructor() {}

  @Input() menuItems!: Array<String>;
  @Output() selectedOption = new EventEmitter<number>();
  showMenu: boolean = false;

  ngOnInit() {}

  dotClicked() {
    this.showMenu = !this.showMenu;
  }

  clickedOutside() {
    this.showMenu = false;
  }

  itemClicked(index: number) {
    this.showMenu = false;
    this.selectedOption.emit(index);
  }
}
