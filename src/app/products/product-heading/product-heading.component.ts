import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { FilterService } from 'src/app/shared/services/filter.service';
import { ModeService } from 'src/app/shared/services/mode.service';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-product-heading',
  templateUrl: './product-heading.component.html',
  styleUrls: ['./product-heading.component.scss']
})
export class ProductHeadingComponent implements OnInit {
  @Input() productCategory = 'All Products';
  @Input() productSubCategory = '';
  @Input() amountOfItem = 0;
  @Input() selectValue = 'newest';
  currentLanguage = 'arabic';
  arabicFont = "'Cairo', sans-serif";
  @HostBinding("style.--font") font: string = '';

  constructor(private notificationService: NotificationService, private modeService: ModeService, private filterService: FilterService) { }

  ngOnInit(): void {
    this.setCurrentLanguage(this.currentLanguage);

    this.modeService.language.subscribe({
      next: (res) => {
        this.setCurrentLanguage(res);
      },

      error: (e) => {
        this.notificationService.showError('Something went wrong');
      }
    })

    if (localStorage.getItem('language')) {
      this.setCurrentLanguage(JSON.parse(localStorage.getItem('language')));
    }
  }

  setCurrentLanguage(myLang) {
    this.currentLanguage = myLang;
    if (this.currentLanguage == 'english') {
      this.font = "'Raleway', sans-serif";
    } else if (this.currentLanguage = 'arabic'){
      this.font = this.arabicFont;
    }
  }

  sortProducts(event) {
    this.filterService.applySorting(event.target.value);
  }

}
