import { Component, OnDestroy, OnInit,HostBinding } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { CartList, SingleProduct } from 'src/app/shared/models';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ProductsService } from '../services/products.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModeService } from 'src/app/shared/services/mode.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy{
  product:SingleProduct;
  productId: number;
  loading: boolean = false;
  amount: number = 1;
  cartProducts: CartList[] = [];
  exist = null;
  faX = faXmark;
  faDel = faTrash;
  images = [];
  isAuth = false;
  userSub: Subscription;
  selectedCategory = 'Mobiles';
  categories = ['Mobiles', 'Mobile Cases', 'Headphones', 'Cables', 'Flash Drivers & Memory', 'Smart Devices', 'Others'];
  formLoading = false;
  myForm: FormGroup;
  modifiedImages = [];
  activeModal;
  titleExist = false;
  productOriginImages = [];
  currentLanguage = 'arabic';
  arabicFont = "'Cairo', sans-serif";
  productPriceBefore = 1;
  showOffer = false;
  priceIsBigger = false;

  @HostBinding("style.--font") font: string = '';


  constructor(private modeService: ModeService, private router: Router, private modalService: NgbModal,private authService: AuthService, private productService: ProductsService, private route: ActivatedRoute, private notificationService: NotificationService) {}
  
  ngOnInit() {
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

    this.userSub = this.authService.user.subscribe(user => {
      this.isAuth = !!user;
    })

    this.route.params.subscribe({
      next: (res:any) => {
        this.productId = res['id'];
        this.getProduct();
      },
      error: (e) => {
        this.notificationService.showError('Something went wrong');
        this.loading = false;
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
      case 'Huwawei':
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

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  openAddProduct(content, modalSize) {
    this.selectedCategory = this.product.categoryName;
    this.titleExist = false;
    this.formLoading = false;

    this.myForm = new FormGroup({
      'id': new FormControl(this.product.id, Validators.required),
      'title': new FormControl(this.product.title, [Validators.required]),
      'price': new FormControl(this.product.price, Validators.required),
      'priceBefore': new FormControl(this.product.priceBefore != null?(this.product.priceBefore, Validators.required) : this.showOffer==true ? (this.productPriceBefore.toFixed(2), Validators.required) : null),
      'amount': new FormControl(this.product.amount, Validators.required),
      'description': new FormControl(this.product.description, Validators.required),
      'category': new FormControl(this.product.categoryName, Validators.required),
      'brand': new FormControl(this.product.brand),
      'status': new FormControl(this.product.status),
      'type': new FormControl(this.product.type),
      'o-s': new FormControl(this.product.os),
      'images': new FormArray(this.imagesToUpdated() ,Validators.required)
    })
    
		this.activeModal = this.modalService.open(content, { centered: true, size: modalSize });
	}

  imagesToUpdated() {
    let allImages = [];
    for (const imageUrl of this.product.images) {
      allImages.push(new FormControl(imageUrl, Validators.required));
    }
    return allImages;
  }

  updatedImagesLinks() {
    let allImages = [];
    for (const imageUrl of this.product.images) {
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
    this.product.images.splice(index,1);
    (<FormArray>this.myForm.get('images')).removeAt(index);
    // let myImages = [];
    // for (const image of this.product.images) {
    //   myImages.push(image)
    // }
    // console.log(myImages);
    // this.myForm.patchValue({
    //   'images': myImages
    // })
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

  getProduct() {
    this.loading = true;
    this.productService.getSigleProduct(this.productId).subscribe({
      next: (res:any) => {
        this.product = res.data[0];
        if (this.product.priceBefore != null && this.product.priceBefore > 0) {
          this.showOffer = true;
        } else {
          this.showOffer = false;
        }
        
        this.productService.getProductImages(this.productId).subscribe({
          next: (imageRes: any) => {
            let productImages:any = [];
            for (const image of imageRes.data) {
              productImages.push(image.imageUrl);
              this.product.images = productImages;
              this.productOriginImages = productImages;
            }
            this.loading = false;
          }
        })
        this.checkIfExist();
      },
      error: (e) => {
        this.notificationService.showError('Something went wrong');
        this.loading = false;
      }
    });
  }

  addAmount() {
    this.amount++;
  }

  reduceAmount() {
    this.amount--;
  }

  checkIfExist() {
    if(localStorage.getItem('cart')) {
      this.cartProducts = JSON.parse(localStorage.getItem('cart'));
      this.exist = this.cartProducts.find(item => item.product.id == this.product.id);
    } else {
      this.exist = null;
    }
  }

  removeFromCart() {
    this.cartProducts.splice(this.cartProducts.indexOf(this.exist), 1);
    this.notificationService.productsAmountInCart.next(this.cartProducts.length);
    this.updateLocalStorage();

    if (this.cartProducts.length == 0) {
      localStorage.clear();
    }
    this.checkIfExist();

    this.notificationService.showInfo('This item is removed from cart');
  }

  updateLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartProducts));
  }

  addProductToCart() {
    if(localStorage.getItem('cart')) {
      this.checkIfExist()
    }

    if (this.exist) {
      this.notificationService.showError(this.product.title + ' has been already added in the cart');
    } else {
      this.product.addedToCart = true;
      this.cartProducts.push({product: this.product, quantity: this.amount});
      this.notificationService.productsAmountInCart.next(this.cartProducts.length);
      this.updateLocalStorage();
      this.checkIfExist();
      this.notificationService.showInfo(this.amount + ' of this item added to cart');
    }
  }

  amountPrice() {
    if (this.product.amount > 0) {
      return 'green';
    } else {
      return 'red';
    }
  }

  onSubmit() {
    this.formLoading = true;

    if (true) {
      if (this.showOffer == true && this.myForm.get('title').value == this.product.title) {
        if (this.myForm.get('priceBefore').value == null || this.myForm.get('price').value > this.myForm.get('priceBefore').value) {
          this.priceIsBigger = true;
          this.formLoading = false;
          return;
        }
      }

      if (this.myForm.get('title').value != this.product.title) {
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

              this.formLoading = true;

              this.productService.updateProduct(this.product.id, this.myForm.value).subscribe({
                next: (res: any) => {
                  if (JSON.stringify(this.myForm.get('images').value) != JSON.stringify(this.productOriginImages)) {
                    this.productService.deleteProductImages(this.product.id).subscribe({
                      next: (delRes) => {
                        for (let index = 0; index < this.myForm.get('images').value.length; index++) {
                          this.productService.addImages(this.product.id, {'image': this.myForm.get('images').value[index]}).subscribe({
                            next: (res) => {
                              if (index == this.myForm.get('images').value.length - 1) {
                                console.log('hello 1');
                                this.productService.deleteProductImages(this.product.id)
                                this.product = this.myForm.value;
                                this.product.priceBefore != null ? this.showOffer = true : this.showOffer = false;
                                this.notificationService.showSuccess('Item updated Successfully!');
                                this.activeModal.close();
                                this.formLoading = false;
                                this.router.navigate(['/productDetails', this.product.id]);
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
                    console.log('hello 2');
                    this.productService.deleteProductImages(this.product.id)
                    this.product = this.myForm.value;
                    this.product.priceBefore != null ? this.showOffer = true : this.showOffer = false;
                    this.notificationService.showSuccess('Item updated Successfully!');
                    this.activeModal.close();
                    this.formLoading = false;
                    this.router.navigate(['/productDetails', this.product.id]);
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
        this.formLoading = true;

        this.productService.updateProduct(this.product.id, this.myForm.value).subscribe({
          next: (res: any) => {
            if (JSON.stringify(this.myForm.get('images').value) != JSON.stringify(this.productOriginImages)) {
              this.productService.deleteProductImages(this.product.id).subscribe({
                next: (delRes) => {
                  for (let index = 0; index < this.myForm.get('images').value.length; index++) {
                    this.productService.addImages(this.product.id, {'image': this.myForm.get('images').value[index]}).subscribe({
                      next: (res) => {
                        if (index == this.myForm.get('images').value.length - 1) {
                          console.log('hello3');
                          this.productService.deleteProductImages(this.product.id)
                          this.product = this.myForm.value;
                          this.product.priceBefore != null ? this.showOffer = true : this.showOffer = false;
                          this.notificationService.showSuccess('Item updated Successfully!');
                          this.activeModal.close();
                          this.formLoading = false;
                          this.router.navigate(['/productDetails', this.product.id]);
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
              console.log('hello 4');
              this.productService.deleteProductImages(this.product.id)
              this.product = this.myForm.value;
              this.notificationService.showSuccess('Item updated Successfully!');
              this.product.priceBefore != null ? this.showOffer = true : this.showOffer = false;
              this.formLoading = false;
              this.activeModal.close();
              location.reload();
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

  confirmDelete(name) {
    this.modalService.open(name, { centered: true, size: "lg" });
  }

  deleteProduct() {
    this.loading = true;
    this.productService.delProduct(this.product.id).subscribe({
      next: (res) => {
        this.notificationService.showSuccess(this.product.title + ' is deleted successfully');
        this.router.navigate(['/']);
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    });
  }
}
