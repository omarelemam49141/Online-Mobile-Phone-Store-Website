import { Component, OnInit } from '@angular/core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { CartList } from 'src/app/shared/models'; 
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit{
  constructor(private notificationService: NotificationService) {}

  faX = faXmark;
  cartProducts: CartList[] = [];
  amountToggle:Boolean = false;
  amount: number = 1;

  ngOnInit() {

  }

  // addProductToCart(thisProduct) {
  //   if (thisProduct.addedToCart == true) {
  //     this.notificationService.showError(this.product.title + ' has been already added to the cart');
  //   } else {
  //     thisProduct.addedToCart = true;
  //     this.cartProducts.push({'product': thisProduct, 'quantity': this.amount});
  //     this.notificationService.productsAmountInCart.next(this.cartProducts.length);
  //     console.log(this.cartProducts);
  //     this.updateLocalStorage();
  //     this.notificationService.showInfo(this.amount + ' of ' + this.product.title + ' is added to the cart');
  //   }

  //   this.amountToggle = false;
  // }

  // removeFromCart(productID) {
  //   this.cartProducts = JSON.parse(localStorage.getItem('cart'));
  //   let theItemToRemove = this.cartProducts.find(item => item.product.id == productID);
  //   this.cartProducts.splice(this.cartProducts.indexOf(theItemToRemove), 1);
  //   this.exist = false;
  //   this.notificationService.productsAmountInCart.next(this.cartProducts.length);
  //   //';;;;;;;;;;;;;;;;;;;;;;;;;;;//
  //   this.product.addedToCart = false;
  //   ////////////////////////////////////
  //   this.updateLocalStorage();
  //   this.notificationService.showInfo(this.product.title + ' is removed from the cart');
  //   this.amountToggle = false;
  //   if(this.cartProducts.length == 0) {
  //     localStorage.clear();
  //   }
  //   console.log(this.cartProducts);
  // }

  // updateLocalStorage() {
  //   localStorage.setItem('cart', JSON.stringify(this.cartProducts));
  // }

  // checkIfExist() {
  //   if (JSON.parse(localStorage.getItem('cart'))) {
  //     this.cartProducts = JSON.parse(localStorage.getItem('cart'));
  //     this.exist = this.cartProducts.find(item => item.product.id == this.product.id) != null ? true : false;
  //   } else {
  //     this.exist = false;
  //   }
  // }
}
