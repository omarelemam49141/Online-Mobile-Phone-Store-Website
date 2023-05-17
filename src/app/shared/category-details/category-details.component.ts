import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterService } from '../services/filter.service';
import { NotificationService } from '../services/notification.service';
import { ModeService } from '../services/mode.service';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit {

  constructor(private modeService: ModeService, private router: ActivatedRoute, private filterService: FilterService, private route: Router, private notificationService: NotificationService) { }

  categoryName = '';
  currentLanguage = 'arabic';
  arabicFont = "'Cairo', sans-serif";
  @HostBinding("style.--font") font: string = '';

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

    this.categoryName = this.router.snapshot.params['name'];

    this.router.params.subscribe(params => {
      this.categoryName = params.name;
    })

    console.log(this.categoryName);
  }

  setCurrentLanguage(myLang) {
    this.currentLanguage = myLang;
    if (this.currentLanguage == 'english') {
      this.font = "'Raleway', sans-serif";
    } else if (this.currentLanguage = 'arabic'){
      this.font = this.arabicFont;
    }
  }

  viewAll(category, subTitle, subCategory) {
    this.filterService.applyCategory(category, subTitle, subCategory);
    this.route.navigate(['/']);
  }
}
