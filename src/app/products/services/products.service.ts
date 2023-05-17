import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  constructor(private http: HttpClient) {}
  productsEvent = new Subject<any>();

  allProductsApi = "https://elkoryphonesite.onrender.com/allProducts";
  productImagesApi = "https://elkoryphonesite.onrender.com/images";

  getAllProducts(pageNumber, limit, sortingType) {
    return this.http.get(`${this.allProductsApi}/pages/${pageNumber}/${limit}/${sortingType}`);
  }

  getAllProductsLength() {
    return this.http.get(`${this.allProductsApi}Length`);
  }

  getAllImages() {
    return this.http.get(`${this.productImagesApi}`);
  }

  getProductImages(productId) {
    return this.http.get(`${this.productImagesApi}/${productId}`);
  }

  getAllProductsImages(iDs) {
    return this.http.get(`${this.productImagesApi}Search/${iDs}`);
  }

  getSigleProduct(productId) {
    return this.http.get(`${this.allProductsApi}/${productId}`);
  }

  addProduct(product) {
    return this.http.post(`${this.allProductsApi}`, product);
  }

  addImages(productId, image) {
    return this.http.post(`${this.productImagesApi}/${productId}`, image);
  }

  updateProduct(productId, updatedProduct) {
    return this.http.put(`${this.allProductsApi}/${productId}`, updatedProduct);
  }

  delProduct(productId) {
    return this.http.delete(`${this.allProductsApi}/${productId}`);
  }

  deleteProductImages(productId) {
    return this.http.delete(`${this.productImagesApi}/${productId}`);
  }

  getProductsByCategory(categoryName, subTitle, subCategory, pageNumber, limit, sortingType) {
    return this.http.get(`${this.allProductsApi}/category/${categoryName}/${subTitle}/${subCategory}/${pageNumber}/${limit}/${sortingType}`);
  }

  searchProduct(value) {
    return this.http.get(`${this.allProductsApi}Search/${value}`);
  }

  searchProductExact(value) {
    return this.http.get(`${this.allProductsApi}SearchExact/${value}`);
  }
}
