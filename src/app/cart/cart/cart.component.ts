import { Component, HostBinding, OnInit} from '@angular/core';
import { faTrash, faCheck, faClose } from '@fortawesome/free-solid-svg-icons'; 
import { CartList, SingleProduct } from 'src/app/shared/models';
import { ModeService } from 'src/app/shared/services/mode.service';
import { CartService } from '../services/cart.service';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbModalConfig, NgbModalRef  } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductsService } from 'src/app/products/services/products.service';
import { AuthService } from 'src/app/auth/auth.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit{
  faDel = faTrash;
  faShow = faEye;
  faAccept = faCheck;
  faDecline = faClose;
  cartProducts: CartList[] = [];
  loading:boolean = false;
  emptyCart:boolean = false;
  totalCartAmount:number = 0;
  fixedAmount;
  mode = 'user';
  modeAtStart = null;
  carts:any = [];
  cartDetails:SingleProduct[] = [];
  orderLoading = false;
  cartsWithKey;
  cartModalReference: NgbModalRef;
  declineModalReference: NgbModalRef;
  removeCartLoading = false;
  declineOrderLoading = false;
  isMessageEmpty = false;
  declineMessage = "";
  messageRequired = false;
  formLoading = false;
  myForm: FormGroup;
  infoModal;
  isAuth = false;
  newOrders = [];
  ordersType = 'pending';

  //paginator
  length = 0;
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  hidePageSize = false;
  showPageSizeOptions = false;
  showFirstLastButtons = true;
  disabled = false;

  //language
  currentLanguage = 'arabic';
  arabicFont = "'Cairo', sans-serif";

  @HostBinding("style.--font") font: string = '';

  constructor(private authService: AuthService, private productsService: ProductsService, private cartService: CartService, private modeService: ModeService, private modalService: NgbModal, private notificationService: NotificationService, config: NgbModalConfig) {
    config.backdrop = 'static';
		config.keyboard = false;
  }

  openCartDetails(content, cart) {
    this.cartDetails = cart;

    this.cartModalReference = this.modalService.open(content, { centered: true, size: 'lg' });
	}

  declineProcess(decline) {
    this.declineModalReference = this.modalService.open(decline, { centered: true, size: 'md' });
  }

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

    this.setModeAtStart();

    this.authService.user.subscribe(res => {
      this.isAuth = !!res;
      this.getCartInfo();
    });
    this.getCartInfo();
  }

  pageEvent: PageEvent;

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.getNewOrders(this.ordersType);
  }

  setCurrentLanguage(myLang) {
    this.currentLanguage = myLang;
    if (this.currentLanguage == 'english') {
      this.font = "'Raleway', sans-serif";
    } else if (this.currentLanguage = 'arabic'){
      this.font = this.arabicFont;
    }
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  getCartInfo() {
    if (this.isAuth == false) {
      this.getCartProducts();
    }

    if (this.isAuth == true) {
      this.getNewOrders('pending');
    }
  }

  getCartProducts() {
    this.loading = true;
    this.checkProductsExisting();
    if (this.cartProducts.length == 0) {
      this.emptyCart = true;
    } else {
      this.emptyCart = false;
      this.calcCartAmount();
    }
    this.loading = false;
  }

  getNewOrders(cartStatus) {
    this.ordersType = cartStatus;
    this.newOrders = [];
    this.loading = true;
    this.cartService.getAllCarts(this.ordersType, this.pageIndex, this.pageSize).subscribe({
      next: (res: any) => {
        this.newOrders = res.data;
        this.length = res.dataLength;
        this.loading = false;
      },
      error: (e) => {
        this.notificationService.showError('Something went wrong');
        this.loading = false;
      }
    });
  }

  clearCart() {
    this.cartProducts = [];
    this.notificationService.productsAmountInCart.next(this.cartProducts.length);
    this.updatedLocalStorage();
    this.emptyCart = true;
  }

  deletProduct(product) {
    this.cartProducts.splice(this.cartProducts.indexOf(product), 1);
    this.notificationService.showInfo(product.product.title + ' is removed from the cart');
    this.notificationService.productsAmountInCart.next(this.cartProducts.length);
    this.updateCart();
    if (this.cartProducts.length == 0) {
      this.emptyCart = true;
    }
  }

  checkProductsExisting() {
    if (localStorage.getItem('cart')) {
      this.cartProducts = JSON.parse(localStorage.getItem('cart'));
    }
  }

  updatedLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartProducts));
  }

  calcCartAmount() {
    this.totalCartAmount = 0;
    for(let product of this.cartProducts) {
      this.totalCartAmount += Number(+product.product.price * product.quantity);
      this.fixedAmount = this.totalCartAmount.toFixed(2);
    }
  }

  updateCart() {
    this.updatedLocalStorage();
    this.calcCartAmount();
  }

  makeOrder() {
    this.checkProductsExisting();
    this.orderLoading = true;
    this.cartService.createOrder(this.cartProducts, this.myForm.value.customerName, this.myForm.value.customerPhone, this.myForm.value.customerAddress).subscribe({
      next: (v) => {
        for (let index = 0; index < this.cartProducts.length; index++) {
          const element = this.cartProducts[index];
          element.product.amount -= element.quantity;
          console.log(element.product);
          this.productsService.updateProduct(element.product.id, element.product).subscribe({
            next: (result) => {
              if (index == this.cartProducts.length - 1) {
                this.clearCart();
                this.orderLoading = false;
                this.infoModal.close();
                this.notificationService.showSuccess('Your order has been sent');
                this.notificationService.ordersAmount.next(true);
              }
            },
            error: (err) => {
              this.notificationService.showError('Something went wrong');
            }
          });
        }
      },
      error: (e) => {
        this.notificationService.showError('Something went wrong');
        this.orderLoading = false;
      }
    });
  }

  setModeAtStart() {
    this.modeAtStart = JSON.parse(localStorage.getItem('userData'));

    if (this.modeAtStart) {
      this.isAuth = true;
    } else {
      this.isAuth = false;
    }
  }

  getCartPrice(cartProducts) {
    let price = 0,
    finalPrice;
    for (const cart of cartProducts) {
      price += (cart.product.price * cart.quantity);
    }

    finalPrice = price.toFixed(2);

    return finalPrice;
  }

  approveOrder(cart) {
    this.orderLoading = true;

    this.cartService.updateCartStatus(cart.id, {cartStatus: 'accepted'}).subscribe({
      next: (res) => {
        this.orderLoading = false;
        this.cartModalReference.close();
        this.notificationService.showSuccess(cart.client + ' order approved');
        this.notificationService.ordersAmount.next(true);
        this.getCartInfo();
      },
      error: (e) => {
        this.notificationService.showError('Something went wrong');
        this.orderLoading = false;
      }
    })
  }

  declineOrder(cart) {
    this.declineOrderLoading = true;

    this.cartService.delCart(cart.id).subscribe({
      next: (res) => {
        for (let index = 0; index < cart.cartProducts.length; index++) {
          const productOrdered = cart.cartProducts[index];
          this.productsService.updateProduct(productOrdered.product.id, productOrdered.product).subscribe({
            next: (updateRes) => {
              if (index == cart.cartProducts.length - 1) {
                this.declineOrderLoading = false;
                this.declineModalReference.close();
                this.removeCartLoading = false;
                this.cartModalReference.close();
                this.notificationService.ordersAmount.next(true);
                this.notificationService.showSuccess('Order has been refused');
                this.getCartInfo();
              }
            },
            error: (updateErr) => {
              if (index == cart.cartProducts.length - 1) {
                this.declineOrderLoading = false;
              }
              this.notificationService.showInfo('This product is not available any more');
            }
          })
        }
      },
      error: (e) => {
        this.notificationService.showError('Something went wrong');
        this.declineOrderLoading = false;
      }
    })
  }

  openSendOrder(content, modalSize) {
    this.formLoading = false;

    this.myForm = new FormGroup({
      'customerName': new FormControl(null, Validators.required),
      'customerPhone': new FormControl(null, Validators.required),
      'customerAddress': new FormControl(null, Validators.required),
    })
    
		this.infoModal = this.modalService.open(content, { centered: true, size: modalSize });
	}

  ordersHeaderBg() {
    if (this.ordersType == 'pending') {
      return 'hsl(261.64deg, 34.46%, 34.71%)';
    } else {
      return 'hsl(0deg 0% 28.35%)';
    }
  }
}
