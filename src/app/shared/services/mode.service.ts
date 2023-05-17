import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModeService {
  constructor() { }

  mode = new Subject<string>();
  language = new Subject<string>();

  setMode(user) {
    this.mode.next(user);
    localStorage.setItem('mode', JSON.stringify(user));
  }

  setLanguage(lang) {
    this.language.next(lang);
    localStorage.setItem('language', JSON.stringify(lang));
  } 
}
