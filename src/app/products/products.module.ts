import { NgModule } from '@angular/core';
import { AllProductsComponent } from './all-products/all-products.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { SharedModule } from '../shared/shared.module';
import { FilteringComponent } from './filtering/filtering.component';
import { ProductComponent } from './product/product.component';
import { AddProductComponent } from './add-product/add-product.component';
import { ProductHeadingComponent } from './product-heading/product-heading.component';

@NgModule({
  declarations: [
    AllProductsComponent,
    ProductDetailsComponent,
    FilteringComponent,
    ProductComponent,
    AddProductComponent,
    ProductHeadingComponent
  ],
  imports: [
    SharedModule
  ]
})
export class ProductsModule { }
