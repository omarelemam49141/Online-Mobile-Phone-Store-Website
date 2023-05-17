import { Injectable } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { Router } from 'express';
import { BehaviorSubject, Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private router: ActivatedRoute) { }

  filterByCategory = new BehaviorSubject<[string, string, string]>(['All Products', 'allTitle', 'allSub']);
  filterByCategorySubject = new Subject<[string, string, string]>();
  filterByCategoryFromHome = new Subject<[string, string, string]>();
  sortingEvent = new Subject<string>();
  searchEvent = new Subject<string>();

  applyCategory(category, subTitle, subCategory) {
    this.filterByCategory.next([category, subTitle, subCategory]);
    this.filterByCategorySubject.next([category, subTitle, subCategory]);
  }

  applySorting(sort) {
    this.sortingEvent.next(sort);
  }

  applySearch(text) {
    this.searchEvent.next(text);
  }

  applyCategoryFromHome(category, subTitle, subCategory) {
    this.filterByCategoryFromHome.next([category, subTitle, subCategory]);
  }
}
