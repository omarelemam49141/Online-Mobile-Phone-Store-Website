import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './cart/cart.component';
import { SharedModule } from '../shared/shared.module';
import { PreviousOrdersComponent } from './previous-orders/previous-orders.component';



@NgModule({
  declarations: [
    CartComponent,
    PreviousOrdersComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class CartModule { }
