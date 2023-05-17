import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filtering',
  templateUrl: './filtering.component.html',
  styleUrls: ['./filtering.component.scss']
})
export class FilteringComponent {
  @Input() title: string = "";
  @Input() items: [] = [];
  @Output() itemEvent = new EventEmitter();
  @Input() modify:boolean = false;
  @Input() categoryToUpadate = null;

  filterElements(value) {
    this.itemEvent.emit(value);
  }

  checkIfReset(index, item) {
    if (index == 0 && this.modify) {
      return true;
    } else if(item) {
      if (item == this.categoryToUpadate) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}


