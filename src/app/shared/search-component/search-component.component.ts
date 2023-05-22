import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { FilterService } from '../services/filter.service';
import { NotificationService } from '../services/notification.service';
import { ProductsService } from 'src/app/products/services/products.service';
import { Router } from '@angular/router';
import { ModeService } from '../services/mode.service';
import { debounceTime, last, take } from 'rxjs';

@Component({
  selector: 'app-search-component',
  templateUrl: './search-component.component.html',
  styleUrls: ['./search-component.component.scss']
})
export class SearchComponentComponent implements OnInit {

  products = [];
  images = [];
  loading = false;
  productsLength = 0;
  length = 0;
  productsImages = [];
  currentLanguage = 'arabic';
  arabicFont = "'Cairo', sans-serif";
  searchText = null;

  @HostBinding("style.--font") font: string = '';

  constructor(private modeService: ModeService, private route: Router ,private filterService: FilterService, private notificationService: NotificationService, private productService: ProductsService) { }

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

    this.filterService.searchEvent.subscribe({
      next: (value) => {
        if (value == '' || value.replace(/\s/g, '') == '') {
          this.searchText = null;
          return;
        } else {
          this.searchText = value;
          this.searchProcess(value);
        }
      },
      error: (err) => {
        this.notificationService.showError('Something went wrong');
      }
    })
  }

  setCurrentLanguage(myLang) {
    this.currentLanguage = myLang;
    if (this.currentLanguage == 'english') {
      this.font = "'Raleway', sans-serif";
    } else if (this.currentLanguage = 'arabic'){
      this.font = this.arabicFont;
    }
  }

  searchProcess(value) {
    this.productService.searchProduct(value).subscribe({
      next: (res: any) => {
        this.products = [];
        this.productsLength = res.data.length;
        this.length = this.productsLength;

        if (this.length > 0) {
          let iDs = [];
          let stringIds = '';
          for (const product of res.data) {      
            iDs.push(product.id);
          }

          stringIds = iDs.join();

          this.productService.getAllProductsImages(stringIds).subscribe({
            next: (imageRes:any) => {
              this.products = [];
              this.productsImages = [];
              this.productsImages = imageRes.data;

              for (const product of res.data) {
                product.images = [];

                for (const image of this.productsImages) {
                  if (product.id == image.productId) {
                    product.images.push(image.imageUrl);
                  }
                }

                this.products.push(product);
              }
            },
            error: (e) => {
              this.notificationService.showError(e.message);
              this.loading = false;
            }
          })
        } else {
          this.products = [];
          this.loading = false;
        }
      },
      error: (err) => {
        this.notificationService.showError('Something went wrong');
      }
    })
  }

  productDetails(id) {
    this.products = [];
    this.route.navigate(['/productDetails', id]);
  }
}
