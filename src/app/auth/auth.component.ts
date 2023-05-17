import { Component, HostBinding, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthResponse, AuthService } from './auth.service';
import { ModeService } from '../shared/services/mode.service';
import { NotificationService } from '../shared/services/notification.service';

let authObs: Observable<AuthResponse>;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent implements OnInit {
  constructor( private notificationService: NotificationService, private modeService: ModeService, private authService: AuthService, private route: Router) {}

  isAuth = false;
  private userSub: Subscription;

  readonlyattr = true;
  loginMode = false;
  error: string = null;
  isLoading = false;
  successMessage: string = null;
  currentLanguage = 'arabic';
  arabicFont = "'Cairo', sans-serif";

  @HostBinding("style.--font") font: string = '';

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
      this.loginMode = !user;
    })

    this.readonlyattr = true;
  }

  setCurrentLanguage(myLang) {
    this.currentLanguage = myLang;
    if (this.currentLanguage == 'english') {
      this.font = "'Raleway', sans-serif";
    } else if (this.currentLanguage = 'arabic'){
      this.font = this.arabicFont;
    }
  }

  onChangeMode() {
    this.loginMode = !this.loginMode;
  }

  onSubmit(authForm: NgForm) {
    const email = authForm.value.email;
    const password = authForm.value.password;

    if (!this.isAuth) {
      this.isLoading = true;
      authObs = this.authService.login(email, password);
    } else {
      this.isLoading = true;
      authObs = this.authService.signUp(email, password);
    }

    authObs.subscribe({
      next: (v) => {
        this.isLoading = false;
        this.successMessage = 'Success';
        this.error = null;
        this.route.navigate(['/recipes']);
      },
      error: (e) => {
        this.error = e;
        this.isLoading = false;
        this.successMessage = null;
      }
    });

    authForm.reset();
  }
}
