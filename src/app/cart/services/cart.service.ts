import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CartList } from 'src/app/shared/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartsApi = "https://elkoryphonesite.onrender.com/carts";
  constructor(private http: HttpClient) { }

  createOrder(cartProducts: CartList[], clientName, clientPhone, clientAddress) {
    let products = JSON.stringify(cartProducts)
    return this.http.post(this.cartsApi, {
      client: clientName,
      phone: clientPhone,
      address: clientAddress,
      date: new Date(),
      cartProducts: products,
      status: 'pending'
    });
  }

  getAllCarts(cartStatus, pageNumber, limit) {
    return this.http.get(`${this.cartsApi}Status/${cartStatus}/${pageNumber}/${limit}`);
  }

  getAllCartsCount(status) {
    return this.http.get(`${this.cartsApi}Count/${status}`);
  }

  delCart(cartId) {
    return this.http.delete(`${this.cartsApi}Delete/${cartId}`)
  }

  updateCartStatus(cartId, cartStatus) {
    console.log(cartStatus);
    return this.http.put(`${this.cartsApi}UpdateStatus/${cartId}`, cartStatus);
  }

  addOrder(order) {
    order.approvedDate = new Date();
    return this.http.post('https://eccomerce-971b5-default-rtdb.firebaseio.com/orders.json', order);
  }

  addRefusedOrder(order) {
    order.refusedDate = new Date();
    return this.http.post('https://eccomerce-971b5-default-rtdb.firebaseio.com/refusedOrders.json', order);
  }

  getRefusedOrders() {
    return this.http.get('https://eccomerce-971b5-default-rtdb.firebaseio.com/refusedOrders.json');
  }

  getAllOrders() {
    return this.http.get('https://eccomerce-971b5-default-rtdb.firebaseio.com/orders.json')
  }
}
