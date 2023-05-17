import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModeService } from 'src/app/shared/services/mode.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CartService } from '../services/cart.service';
import { faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-previous-orders',
  templateUrl: './previous-orders.component.html',
  styleUrls: ['./previous-orders.component.scss']
})
export class PreviousOrdersComponent implements OnInit {

  constructor(private modalService: NgbModal, private modeService: ModeService, private cartService: CartService, private notificationService: NotificationService) { }

  modeAtStart = null;
  mode = 'user';
  previousOrders = [];
  loading = false;
  ordertDetails = null;
  orderModalReference: NgbModalRef;
  faShow = faEye;
  carts = [];
  refusedOrdersList = [];
  acceptedOrdersList = [];
  ordersType = 'pending';

  ngOnInit(): void {
    this.setModeAtStart();
    if (this.mode == 'admin') {
      this.getPreviousOrders();
    }
    
    if (this.mode == 'user') {
      this.getCarts();
    }

    this.modeService.mode.subscribe(res => {
      this.mode = res;
      if (this.mode == 'admin') {
        this.getPreviousOrders();
      }
      
      if (this.mode == 'user') {
        this.getCarts();
      }
    });
  }

  setModeAtStart() {
    this.modeAtStart = JSON.parse(localStorage.getItem('mode'));

    if (this.modeAtStart) {
      this.mode = this.modeAtStart;
    } else {
      this.mode = 'user';
    }
  }

  pendingOrders() {
    this.ordersType = 'pending';
    this.getCarts();
  }

  acceptedOrders() {
    this.ordersType = 'accepted';
    this.getAcceptedOrders();
  }

  refusedOrders() {
    this.ordersType = 'refused';
    this.getRefusedOrders()
  }

  getPreviousOrders() {
    if (this.mode == "user") {
      return;
    }

    if (this.mode == "admin") {
      this.getReviews();
    }
  }

  getReviews() {
    this.loading = true;
    this.cartService.getAllOrders().subscribe({
      next: (res) => {
        this.previousOrders = [];
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            this.previousOrders.push(res[key]);
          }
        }
        this.loading = false;
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    })
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

  getDuration(acceptedDate) {
    let finalDuration = '';
    let durationInSeconds = (new Date().getTime() - new Date(acceptedDate).getTime()) / 1000;
    if (durationInSeconds < 60) {
      finalDuration = "Less than minute ago";
    } else if (durationInSeconds >= 60 && durationInSeconds < 3600) {
      finalDuration = Math.round(durationInSeconds / 60) + " minutes ago";
    } else if (durationInSeconds >= 3600 && durationInSeconds < 86400) {
      finalDuration = Math.round(durationInSeconds / 3600) + " hours ago";
    } else if (durationInSeconds >= 86400) {
      finalDuration = Math.round(durationInSeconds / 86400) + " days ago";
    }

    return finalDuration;
  }

  openCartDetails(content, order) {
    this.ordertDetails = order;
    this.orderModalReference = this.modalService.open(content, { centered: true, size: 'lg' });
	}

  getCarts() {
    this.emptyOrders();
    this.loading = true;
    this.cartService.getAllCarts('pending', null, null).subscribe({
      next: (res) => {
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            this.carts.push(res[key]);
          }
        }
        this.loading = false;
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    });
  }

  getRefusedOrders() {
    this.emptyOrders();
    this.loading = true;
    this.cartService.getRefusedOrders().subscribe({
      next: (res) => {
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            this.refusedOrdersList.push(res[key]);
          }
        }
        this.loading = false;
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    });
  }

  getAcceptedOrders() {
    this.emptyOrders();
    this.loading = true;
    this.cartService.getAllOrders().subscribe({
      next: (res) => {
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            this.acceptedOrdersList.push(res[key]);
          }
        }
        this.loading = false;
      },
      error: (e) => {
        this.notificationService.showError(e.message);
        this.loading = false;
      }
    });
  }

  settingOrdersBacground() {
    if (this.ordersType == 'pending') {
      return '#b6cee7';
    } else if (this.ordersType == 'accepted') {
      return '#b6e3e7';
    } else if (this.ordersType == 'refused') {
      return '#e7b6b6';
    }
  }

  emptyOrders() {
    this.carts = [];
    this.refusedOrdersList = [];
    this.acceptedOrdersList = [];
  }
}
