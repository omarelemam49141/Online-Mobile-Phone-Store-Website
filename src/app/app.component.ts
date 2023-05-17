import { AfterViewInit, Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { ModeService } from './shared/services/mode.service';
import { NotificationService } from './shared/services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit{
  title = 'Online Market OE';
  isLoading: boolean;
  currentLanguage = 'arabic';

  constructor(private cdref: ChangeDetectorRef, private authService: AuthService, private modeService: ModeService, private notificationService: NotificationService) {
    this.isLoading = true;
  }

  ngOnInit(): void {
    this.authService.autoLogin();

    this.modeService.language.subscribe({
      next: (res) => {
        this.currentLanguage = res;
      },
      error: (err) => {
        this.notificationService.showError('Language error');
      }
    })

    if (localStorage.getItem('language')) {
      this.currentLanguage = JSON.parse(localStorage.getItem('language'));
    }
  }

  ngAfterViewInit() {
    this.isLoading = false;
    this.cdref.detectChanges();
  }
}
