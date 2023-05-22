import { Component, OnInit, ViewChild, HostBinding } from '@angular/core';
import { CartList } from 'src/app/shared/models';
import { ProductsService } from '../services/products.service';
import { faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NgbCarousel, NgbModal, NgbModalConfig, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { Subscription } from 'rxjs'; 
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { FilterService } from 'src/app/shared/services/filter.service';
import { MatPaginatorIntl, PageEvent}  from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeService } from 'src/app/shared/services/mode.service';
import { getDutchPaginatorIntl } from 'src/app/shared/services/dutch-paginator-intl';

export let myServiceFactory = (language) => {
  if (language == 'arabic') {
    return getDutchPaginatorIntl('arabic');
  } else {
    return getDutchPaginatorIntl('english');
  }
}; 

@Component({
  selector: 'app-all-products',
  templateUrl: './all-products.component.html',
  styleUrls: ['./all-products.component.scss'],

  providers: [
    { provide: MatPaginatorIntl, useFactory: myServiceFactory }
  ]
})

export class AllProductsComponent implements OnInit {
  constructor(private modeService: ModeService, private route: Router, private filterService: FilterService ,private authService:AuthService, private notificationService: NotificationService, private productService: ProductsService, private router: ActivatedRoute, private modalService: NgbModal, config: NgbModalConfig) {
    config.backdrop = 'static';
		config.keyboard = false;
  }

  // images = [62, 83, 466, 965, 982, 1043, 738].map((n) => `https://picsum.photos/id/${n}/900/500`);
  images = ["../../../assets/images/carousel1.png", "../../../assets/images/carousel2.png", "../../../assets/images/carousel3.jpg"];

	paused = false;
	unpauseOnArrow = false;
	pauseOnIndicator = false;
	pauseOnHover = true;
	pauseOnFocus = true;

  @ViewChild('carousel', { static: true }) carousel: NgbCarousel;

  activeModal;
  isAuth = false;
  private userSub: Subscription;


  faX = faXmark;
  cartProducts: CartList[] = [];
  amountToggle:Boolean = false;
  amount: number = 1;

  products = [];
  productsLength = 0;
  newAddingId = 0;
  sortingType = 'Newest';
  productsImages = [];
  categories = ['Mobiles', 'Mobile Cases', 'Headphones', 'Cables', 'Flash Drivers & Memory', 'Smart Devices', 'Others'];
  loading = false;
  imageLoading = false;
  mode = 'user';
  faDel = faTrash;
  addingType = '';
  productPrice = 1;
  productAmount = 0;
  myForm: FormGroup;
  selectedCategory = "Mobiles";
  modifiedImages = [];
  newProduct = true;
  formLoading = false;
  newProductId = null;
  productToUpdate = null;
  productToUpdateImagesCopy = [];
  updatedProducts:any = [];
  productToDelete = null;
  brand = 'Apple';
  status = 'New';
  productType = '';
  os = 'iOS';
  formChanged = false;
  categoryClicked = 'All Products';
  subCategoryClicked = 'allSub';
  subTitleClicked = '';
  observ: Subscription;
  @ViewChild('content', {static: false}) content;
  titleExist = false;
  productToUpdatePrice = 0;
  productToUpdatePriceBefore = 0;

  // paginator
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  hidePageSize = false;
  showPageSizeOptions = false;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent: PageEvent;

  //language
  currentLanguage = 'arabic';
  arabicFont = "'Cairo', sans-serif";
  @HostBinding("style.--font") font: string = '';

  //form
  showOffer = false;
  productPriceBefore = 1;
  priceIsBigger = false;

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    if (this.categoryClicked == 'All Products') {
      this.getProducts();
    } else {
      this.filterProductsByCategory(this.categoryClicked, this.subTitleClicked, this.subCategoryClicked);
    }
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }
  // end paginator

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuth = !!user;
    })

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

    if (!this.isAuth) {
      localStorage.getItem('cart') ? this.cartProducts = JSON.parse(localStorage.getItem('cart')) : this.cartProducts = [];
    }

    this.observ = this.filterService.filterByCategorySubject.subscribe({
      next: ([categoryName, subTitle, subName]) => {
        if (this.route.url == '/') {
          this.categoryClicked = categoryName;
          this.subCategoryClicked = subName;
          this.subTitleClicked = subTitle;
          this.getProducts();
        } else {
          this.observ.unsubscribe();
        }
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    })

    this.filterService.filterByCategory.pipe(take(1)).subscribe({
      next: ([categoryName, subTitle, subName]) => {
        this.categoryClicked = categoryName;
        this.subCategoryClicked = subName;
        this.subTitleClicked = subTitle;
        this.getProducts();
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    });

    this.filterService.filterByCategoryFromHome.subscribe({
      next: ([categoryName, subTitle, subName]) => {
        this.categoryClicked = categoryName;
        this.subCategoryClicked = subName;
        this.subTitleClicked = subTitle;
        this.getProducts();
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    });

    this.filterService.sortingEvent.subscribe({
      next: (sort) => {
        this.filteringProcess(sort);
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    })
  }

  //start image slider
  togglePaused() {
		if (this.paused) {
			this.carousel.cycle();
		} else {
			this.carousel.pause();
		}
		this.paused = !this.paused;
	}

	onSlide(slideEvent: NgbSlideEvent) {
		if (
			this.unpauseOnArrow &&
			slideEvent.paused &&
			(slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)
		) {
			this.togglePaused();
		}
		if (this.pauseOnIndicator && !slideEvent.paused && slideEvent.source === NgbSlideEventSource.INDICATOR) {
			this.togglePaused();
		}
	}
  //end image slider

  setCurrentLanguage(myLang) {
    this.currentLanguage = myLang;
    if (this.currentLanguage == 'english') {
      this.font = "'Raleway', sans-serif";
      myServiceFactory('english');
    } else if (this.currentLanguage = 'arabic'){
      this.font = this.arabicFont;
      myServiceFactory('arabic');
    }
  }

  categoryClickedArabic(categoryClicked) {
    switch(categoryClicked) {
      case 'Mobiles':
        return 'هواتف';
      case 'All Products':
        return 'كل الأنواع';
      case 'Mobile Cases':
        return 'جرابات';
      case 'Headphones':
        return 'سماعات';
      case 'Cables':
        return 'كابلات';
      case 'Flash Drivers & Memory':
        return 'فلاشات و ميمورى كارد';
      case 'Smart Devices':
        return 'أجهزة ذكية';
      case 'Others':
        return 'أخرى';
    }
  }

  subCategoryClickedArabic(subCategoryClicked) {
    switch(subCategoryClicked) {
      case 'Apple':
        return 'أبل';
      case 'Samsung':
        return 'سامسونج';
      case 'Oppo':
        return 'أوبو';
      case 'Xiaomi':
        return 'شاومى';
      case 'Realme':
        return 'ريلمى';
      case 'Huawei':
        return 'هواوى';
      case 'Nokia':
        return 'نوكيا';
      case 'New':
        return 'جديد';
      case 'Zero':
        return 'زيرو';
      case 'Used':
        return 'مستعمل';
      case 'iOS':
        return 'iOS';
      case 'Android':
        return 'أندرويد';
      case 'Mobiles':
        return 'هواتف';
      case 'Airpods':
        return 'سماعات لاسلكية';
      case 'Tablets':
        return 'تابلت';
      case 'Headsets':
        return 'سماعات رأس';
      case 'Micro':
        return 'مايكرو';
      case 'Type C':
        return 'Type C';
      case 'I phone':
        return 'I phone';
      case 'Flash Drivers':
        return 'فلاشات';
      case 'Memory Card':
        return 'ميمورى كارد';
      case 'Smart watch':
        return 'ساعات ذكية';
    }
  }



  filteringProcess(sort) {
    this.sortingType = sort;
    if(this.categoryClicked == 'All Products') {
      this.getProducts();
    } else {
      this.filterProductsByCategory(this.categoryClicked, this.subTitleClicked, this.subCategoryClicked);
    }
  }

  filterProductsByCategory(categoryName, subTitle, subCategory) {
    this.loading = true;
    this.imageLoading = true;
    this.productService.getProductsByCategory(categoryName, subTitle, subCategory, this.pageIndex, this.pageSize, this.sortingType).subscribe({
      next: (res:any) => {
        this.products = [];
        if (res.data == 'no data') {
          this.productsLength = 0;
          this.length = this.productsLength;
          this.loading = false;
          return;
        }

        this.productsLength = res.dataLength;
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
              this.productService.getAllProductsLength().subscribe({
                next: (count: any) => {
                  this.newAddingId = count.newIdNumber;
                  this.productsImages = [];
                  this.productsImages = imageRes.data;

                  for (const product of res.data) {
                    if (!this.isAuth ) {
                      let pro = this.cartProducts.find(item => {
                        return item.product.id == product.id;
                      })
                      
                      if (pro) {
                        product.addedToCart = true;
                      } else {
                        product.addedToCart = false;
                      }
                    }

                    product.images = [];

                    for (const image of this.productsImages) {
                      if (product.id == image.productId) {
                        product.images.push(image.imageUrl);
                      }
                    }

                    this.products.push(product);
                  }

                  this.updatedProducts = res;
                  this.loading = false;
                  this.newProductId = this.products.length;
                  if (this.myForm) {
                    this.myForm.patchValue({
                      'id': this.newAddingId
                    });
                    this.formLoading = false;
                  }
                },
                error: (e) => {
                  this.notificationService.showError(e.message);
                  this.loading = false;
                }
              })
            }, 
            error: (e) => {
              this.notificationService.showError(e.message);
              this.loading = false;
            }
          });
        } else {
          this.products = [];
          this.loading = false;
        }
      }, 
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    });
  }

  openAddProduct(content, type, modalSize, product=null) {
    this.formLoading = false;
    this.addingType = type;
    this.priceIsBigger = false;
    this.showOffer = false;
    if(this.addingType == 'Add product') {
      this.selectedCategory = 'Mobiles';
      this.productPrice = 1;
      this.productPriceBefore = 1;
    } else {
      this.selectedCategory = product.categoryName;
      if (product.priceBefore != null && product.priceBefore > 0) {
        this.showOffer = true;
      }
    }

    if (this.addingType == 'Add product' || this.addingType == 'Update product') {
      this.productToUpdate = product;
      if (this.productToUpdate) {
        this.productToUpdatePrice = product.price;
        this.productToUpdatePriceBefore = product.priceBefore;
      }

      this.titleExist = false;

      this.myForm = new FormGroup({
        'id': new FormControl(this.productToUpdate?this.productToUpdate.id:this.newAddingId + 1, Validators.required),
        'title': new FormControl(this.productToUpdate?this.productToUpdate.title:null, [Validators.required]),
        'price': new FormControl(this.productToUpdate?this.productToUpdate.price:this.productPrice.toFixed(2), Validators.required),
        'priceBefore': new FormControl(this.productToUpdate && this.productToUpdate.priceBefore != null?(this.productToUpdate.priceBefore, Validators.required) : this.showOffer==true ? (this.productPriceBefore.toFixed(2), Validators.required) : null),
        'amount': new FormControl(this.productToUpdate?this.productToUpdate.amount:this.productAmount.toFixed(2), Validators.required),
        'description': new FormControl(this.productToUpdate?this.productToUpdate.description:null, Validators.required),
        'category': new FormControl(this.productToUpdate?this.productToUpdate.categoryName:this.categories[0], Validators.required),
        'brand': new FormControl(this.productToUpdate?this.productToUpdate.brand:this.defaultField('brand')),
        'status': new FormControl(this.productToUpdate?this.productToUpdate.status:this.defaultField('status')),
        'type': new FormControl(this.productToUpdate?this.productToUpdate.type:this.defaultField('type')),
        'o-s': new FormControl(this.productToUpdate? this.productToUpdate['os']: this.defaultField('os')),
        'images': new FormArray(this.productToUpdate?this.imagesToUpdated():[],Validators.required)
      })
    }
    
		this.activeModal = this.modalService.open(content, { centered: true, size: modalSize });
	}

  productpriceValidator(control: FormControl): {[s:string]: boolean} {
    if (this.myForm.get('price').value > control.value) {
      return {'priceIsBigger': true};
    } else {
      return null;
    }
  }

  defaultField(type) {
    if (type == 'os') {
      if (this.selectedCategory == 'Mobiles') {
        return this.os;
      } else {
        return null;
      }
    } else if (type == 'brand') {
      if (this.selectedCategory == 'Mobiles' || this.selectedCategory == 'Mobile Cases') {
        return this.brand;
      } else {
        return null;
      }
    } else if (type == 'status') {
      if (this.selectedCategory == 'Mobiles') {
        return this.status;
      } else {
        return null;
      }
    } else if (type == 'type') {
      if (this.selectedCategory == 'Mobile Cases') {
        return 'Mobiles';
      } else if (this.selectedCategory == 'Headphones') {
        return 'Airpods';
      } else if (this.selectedCategory == 'Cables') {
        return 'Micro';
      } else if (this.selectedCategory == 'Flash Drivers & Memory') {
        return 'Flash drivers';
      } else if (this.selectedCategory == 'Smart Devices') {
        return 'Smart watch';
      } else {
        return null;
      }
    }
  }

  imagesToUpdated() {
    let allImages = [];
    for (const imageUrl of this.productToUpdate.images) {
      allImages.push(new FormControl(imageUrl, Validators.required));
    }
    return allImages;
  }

  updatedImagesLinks() {
    let allImages = [];
    for (const imageUrl of this.productToUpdate.images) {
      allImages.push(imageUrl);
    }
    return allImages;
  }

  addImage() {
    (<FormArray>this.myForm.get('images')).push(
      new FormControl(null, Validators.required)
    )
  }

  getImages() {
    return (<FormArray>this.myForm.get('images')).controls;
  }

  deleteImage(index: number) {
    (<FormArray>this.myForm.get('images')).removeAt(index);
    if (this.addingType == 'Update product') {
      this.formChanged = true;
      this.productToUpdate.images.splice(index, 1);
    }
  }

  categorySelected(event) {
    this.selectedCategory = event.target.value;
    switch(this.selectedCategory) {
      case 'Mobiles':
        this.myForm.patchValue({
          'brand': 'Apple',
          'status': 'New',
          'o-s': 'iOS',
          'type': null
        })
        break;
      case 'Mobile Cases':
        this.myForm.patchValue({
          'brand': 'Apple',
          'type': 'Mobiles',
          'status': null,
          'o-s': null,
        })
        break;
      case 'Headphones':
        this.myForm.patchValue({
          'type': 'Airpods',
          'status': null,
          'o-s': null,
          'brand': null
        })
        break;
      case 'Cables':
        this.myForm.patchValue({
          'type': 'Micro',
          'status': null,
          'o-s': null,
          'brand': null
        })
        break;
      case 'Flash Drivers & Memory':
        this.myForm.patchValue({
          'type': 'Flash Drivers',
          'status': null,
          'o-s': null,
          'brand': null
        })
        break;
      case 'Smart Devices':
        this.myForm.patchValue({
          'type': 'Smart watch',
          'status': null,
          'o-s': null,
          'brand': null
        })
        break;
    }
    this.myForm.patchValue({
      'category': this.selectedCategory
    })
  }

  setImage(imageUrl, index) {
    this.modifiedImages[index] = imageUrl;
    this.myForm.patchValue({
      'images': this.modifiedImages
    })
  }

  getProducts() {
    if (this.categoryClicked == 'All Products') {
      this.loading = true;
      this.imageLoading = true;
      this.productService.getAllProducts(this.pageIndex, this.pageSize, this.sortingType).subscribe({
        next: (res:any) => {
          this.products = [];
          if (res.data == 'no data') {
            this.productsLength = 0;
            this.length = this.productsLength;
            this.loading = false;
            return;
          }

          this.productsLength = res.dataLength;
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
                this.productService.getAllProductsLength().subscribe({
                  next: (count: any) => {
                    this.newAddingId = count.newIdNumber;
                    this.productsImages = [];
                    this.productsImages = imageRes.data;

                    for (const product of res.data) {
                      if (!this.isAuth ) {
                        let pro = this.cartProducts.find(item => {
                          return item.product.id == product.id;
                        })
                        
                        if (pro) {
                          product.addedToCart = true;
                        } else {
                          product.addedToCart = false;
                        }
                      }

                      product.images = [];
  
                      for (const image of this.productsImages) {
                        if (product.id == image.productId) {
                          product.images.push(image.imageUrl);
                        }
                      }

                      this.products.push(product);
                    }
  
                    this.updatedProducts = res;
                    this.loading = false;
                    this.newProductId = this.products.length;
                    if (this.myForm) {
                      this.myForm.patchValue({
                        'id': this.newAddingId
                      });
                      this.formLoading = false;
                    }
                  },
                  error: (e) => {
                    this.notificationService.showError(e.message);
                    this.loading = false;
                  }
                })
              }, 
              error: (e) => {
                this.notificationService.showError(e.message);
                this.loading = false;
              }
            });
          } else {
            this.products = [];
            this.loading = false;
          }
        }, 
        error: (e) => {
          this.notificationService.showError(e.message);
          this.loading = false;
        }
      });
    } else {
      this.filterProductsByCategory(this.categoryClicked, this.subTitleClicked, this.subCategoryClicked);
    }
  }

  confirmDelete(name, product) {
    this.productToDelete = product;
    this.modalService.open(name, { centered: true, size: "lg" });
  }

  deleteProduct(product) {
    this.loading = true;
    this.productService.delProduct(product.id).subscribe({
      next: (res) => {
        this.notificationService.showSuccess(product.title + ' is deleted successfully');
        this.getProducts();
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    });
  }

  onSubmit(addingType) {
    this.formLoading = true;

    if (addingType == 'Add product') {
      this.productService.searchProductExact(this.myForm.get('title').value).subscribe({
        next: (v: any) => {
          if (v.dataLength == 1) {
            this.titleExist = true;

            if (this.showOffer == true) {
              if (this.myForm.get('priceBefore').value == null || this.myForm.get('price').value > this.myForm.get('priceBefore').value) {
                this.priceIsBigger = true;
              }
            }
            this.formLoading = false;
            return;
          } else {
            if (this.showOffer == true) {
              if (this.myForm.get('priceBefore').value == null || this.myForm.get('price').value > this.myForm.get('priceBefore').value) {
                this.priceIsBigger = true;
                this.formLoading = false;
                return;
              }
            }
            this.titleExist = false;
            this.priceIsBigger = false;
            this.productService.addProduct(this.myForm.value).subscribe({
              next: (v:any) => {
                for (let index = 0; index < this.modifiedImages.length; index++) {
                  this.productService.addImages(this.myForm.value.id, {'image': this.modifiedImages[index]}).subscribe({
                    next: (res) => {
                      if (index == this.modifiedImages.length - 1) {
                        this.notificationService.showSuccess(this.myForm.get('title').value + ' added successfully');
                        this.modifiedImages = [];
                        this.myForm.reset();
                        this.productPrice = 1;
                        this.selectedCategory = this.categories[0];
                        this.myForm.patchValue({
                          'price': this.productPrice,
                          'priceBefore': this.productPriceBefore,
                          'category': this.categories[0],
                          'brand': 'Apple',
                          'status': 'New',
                          'o-s': 'iOS',
                          'type': null,
                        })
                        this.activeModal.close();
      
                        this.getProducts();
                      }
                    },
        
                    error: (e) => {
                      this.notificationService.showError(e.message);
                      this.formLoading = false;
                    }
                  })
                } 
              },
              error: (e) => {
                this.notificationService.showError(e.message);
                this.formLoading = false;
              }
            });
          }
        },
        error: (e) => {
          this.notificationService.showError(e.message);
          this.formLoading = false;
        }
      })
    }

    if (addingType == 'Update product') {
      if (this.showOffer == true && this.myForm.get('title').value == this.productToUpdate.title) {
        if (this.myForm.get('priceBefore').value == null || this.myForm.get('price').value > this.myForm.get('priceBefore').value) {
          this.priceIsBigger = true;
          this.formLoading = false;
          return;
        }
      }

      if (this.myForm.get('title').value != this.productToUpdate.title) {
        this.productService.searchProductExact(this.myForm.get('title').value).subscribe({
          next: (v: any) => {
            if (v.dataLength == 1) {
              this.titleExist = true;

              if (this.showOffer == true) {
                if (this.myForm.get('priceBefore').value == null || this.myForm.get('price').value > this.myForm.get('priceBefore').value) {
                  this.priceIsBigger = true;
                }
              }
              this.formLoading = false;
              return;
            } else {
              if (this.showOffer == true) {
                if (this.myForm.get('priceBefore').value == null || this.myForm.get('price').value > this.myForm.get('priceBefore').value) {
                  this.priceIsBigger = true;
                  this.formLoading = false;
                  return;
                }
              }
              this.titleExist = false;
              this.formChanged = true;

              this.formLoading = true;

              this.productService.updateProduct(this.productToUpdate.id, this.myForm.value).subscribe({
                next: (res: any) => {
                  if (JSON.stringify(this.myForm.get('images').value) != JSON.stringify(this.updatedImagesLinks())) {
                    this.productService.deleteProductImages(this.productToUpdate.id).subscribe({
                      next: (delRes) => {
                        for (let index = 0; index < this.myForm.get('images').value.length; index++) {
                          this.productService.addImages(this.productToUpdate.id, {'image': this.myForm.get('images').value[index]}).subscribe({
                            next: (res) => {
                              if (index == this.modifiedImages.length - 1) {
                                this.productService.deleteProductImages(this.productToUpdate.id)
                                this.productToUpdate = this.myForm.value;
                                this.productToUpdate.priceBefore != null ? this.showOffer = true : this.showOffer = false;
                                this.notificationService.showSuccess('Item updated Successfully!');
                                this.activeModal.close();
                                this.formLoading = false;
                                this.getProducts();
                              }
                            },
                            error: (e) => {
                              this.notificationService.showError(e.message);
                              this.formLoading = false;
                            }
                          })
                        } 
                      },
                      error: (e) => {
                        this.notificationService.showError(e.message);
                        this.formLoading = false;
                      }
                    })
                  } else {
                    this.productService.deleteProductImages(this.productToUpdate.id)
                    this.productToUpdate = this.myForm.value;
                    this.myForm.setValue(this.productToUpdate);
                    this.productToUpdate.priceBefore != null ? this.showOffer = true : this.showOffer = false;
                    this.notificationService.showSuccess('Item updated Successfully!');
                    this.activeModal.close();
                    this.formLoading = false;
                    this.getProducts();
                  }
                },
                error: (e) => {
                  this.notificationService.showError(e.message);
                  this.formLoading = false;
                }
              });
            }
          },
          error: (e) => {
            this.notificationService.showError(e.message);
            this.formLoading = false;
          }
        })
      } else {
        this.formChanged = true;

        this.formLoading = true;

        this.productService.updateProduct(this.productToUpdate.id, this.myForm.value).subscribe({
          next: (res: any) => {
            if (JSON.stringify(this.myForm.get('images').value) != JSON.stringify(this.updatedImagesLinks())) {
              this.productService.deleteProductImages(this.productToUpdate.id).subscribe({
                next: (delRes) => {
                  for (let index = 0; index < this.myForm.get('images').value.length; index++) {
                    this.productService.addImages(this.productToUpdate.id, {'image': this.myForm.get('images').value[index]}).subscribe({
                      next: (res) => {
                        if (index == this.modifiedImages.length - 1) {
                          this.productService.deleteProductImages(this.productToUpdate.id)
                          this.productToUpdate = this.myForm.value;
                          this.productToUpdate.priceBefore != null ? this.showOffer = true : this.showOffer = false;
                          this.notificationService.showSuccess('Item updated Successfully!');
                          this.activeModal.close();
                          this.formLoading = false;
                          this.getProducts();
                        }
                      },
                      error: (e) => {
                        this.notificationService.showError(e.message);
                        this.formLoading = false;
                      }
                    })
                  } 
                },
                error: (e) => {
                  this.notificationService.showError(e.message);
                  this.formLoading = false;
                }
              })
            } else {
              this.productService.deleteProductImages(this.productToUpdate.id)
              this.productToUpdate = this.myForm.value;
              this.productToUpdate.priceBefore != null ? this.showOffer = true : this.showOffer = false;
              this.notificationService.showSuccess('Item updated Successfully!');
              this.activeModal.close();
              this.formLoading = false;
              this.getProducts();
            }
          },
          error: (e) => {
            this.notificationService.showError(e.message);
            this.formLoading = false;
          }
        });
      }
      
      // if(this.myForm.get('title').value == this.productToUpdate.title
      // && this.myForm.get('price').value == this.productToUpdate.price
      // && this.myForm.get('description').value == this.productToUpdate.description
      // && this.myForm.get('category').value == this.productToUpdate.category
      // && this.myForm.get('amount').value == this.productToUpdate.amount
      // && JSON.stringify(this.myForm.get('images').value) == JSON.stringify(this.updatedImagesLinks())
      // && this.myForm.get('brand') ? this.myForm.get('brand').value == this.productToUpdate.brand : false
      // && this.myForm.get('type') ? this.myForm.get('type').value == this.productToUpdate.type : false
      // && this.myForm.get('status') ? this.myForm.get('status').value == this.productToUpdate.status : false 
      // && this.myForm.get('o-s') ? this.myForm.get('o-s').value == this.productToUpdate['o-s'] : false) {
      //   this.formChanged = false;
      //   this.notificationService.showInfo('Nothing changed!');
      //   this.formLoading = false;
      //   return;
      // }
    }
  }

  // single product
  addProductToCart(thisProduct) {
    if (this.cartProducts.length > 0) {
      if (this.cartProducts.find(item => item.product.id == thisProduct.id)) {
        this.notificationService.showError(thisProduct.title + ' has been already added to the cart');
      } else{
        this.addingProcess(thisProduct);
      }
    } else {
      this.addingProcess(thisProduct)
    }
  }

  addingProcess(thisProduct) {
    this.cartProducts.push({'product': thisProduct, 'quantity': this.amount});
    this.notificationService.productsAmountInCart.next(this.cartProducts.length);
    document.getElementById(thisProduct.id + '-adding-btn').style.setProperty("display", "none", "important");
    document.getElementById(thisProduct.id + '-adding-btnContainer').style.setProperty("display", "none", "important");
    document.getElementById(thisProduct.id + '-adding-btnRemove').style.setProperty("display", "block", "important");
    // product.id + '-adding-btn
    this.updateLocalStorage();
    this.notificationService.showInfo(this.amount + ' of ' + thisProduct.title + ' is added to the cart');
    this.amount = 1;
  }

  removeFromCart(productID) {
    this.cartProducts = JSON.parse(localStorage.getItem('cart'));
    let theItemToRemove = this.cartProducts.find(item => item.product.id == productID);
    this.cartProducts.splice(this.cartProducts.indexOf(theItemToRemove), 1);
    this.notificationService.productsAmountInCart.next(this.cartProducts.length);
    document.getElementById(productID + '-adding-btn').style.setProperty("display", "block", "important");
    document.getElementById(productID + '-adding-btnContainer').style.setProperty("display", "none", "important");
    document.getElementById(productID + '-adding-btnRemove').style.setProperty("display", "none", "important");
    //';;;;;;;;;;;;;;;;;;;;;;;;;;;//
    theItemToRemove.product.addedToCart = false;
    ////////////////////////////////////
    this.updateLocalStorage();
    this.notificationService.showInfo(theItemToRemove.product.title + ' is removed from the cart');
    this.amountToggle = false;
    if(this.cartProducts.length == 0) {
      localStorage.clear();
    }
  }

  amountToogle(addingContainerId) {
    document.getElementById(addingContainerId).style.setProperty("display", "none", "important");
    document.getElementById(addingContainerId + 'Container').style.setProperty("display", "flex", "important");
    document.getElementById(addingContainerId + 'Remove').style.setProperty("display", "none", "important");
  }

  updateLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartProducts));
  }

  checkIfAdded(thisProduct, type) {
    if (thisProduct.addedToCart && type == 'btn') {
      return 'none';
    } else if (thisProduct.addedToCart && type == 'remove') {
      return 'block';
    } else if (!thisProduct.addedToCart && type == 'remove') {
      return 'none';
    } else if (!thisProduct.addedToCart && type == 'btn') {
      return 'block';
    }
  }

  checkPriceToggler(event) {
    if (event.target.checked) {
      this.showOffer = true;
    } else {
      this.showOffer = false;
      this.myForm.patchValue({
        'priceBefore': null
      })
    }
  }
}
