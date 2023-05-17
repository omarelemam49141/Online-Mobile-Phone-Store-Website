import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SpinnerComponent } from './spinner/spinner.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbCarouselConfig, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { FormSpinnerComponent } from './form-spinner/form-spinner.component';
import { ToastrModule } from 'ngx-toastr';
import { NotificationSpinnerComponent } from './notification-spinner/notification-spinner.component';
import { CategoryDetailsComponent } from './category-details/category-details.component';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import { SearchComponentComponent } from './search-component/search-component.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SpinnerComponent,
    ImageUploadComponent,
    FormSpinnerComponent,
    NotificationSpinnerComponent,
    CategoryDetailsComponent,
    SearchComponentComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgbCollapseModule,
    FormsModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgbCarouselModule,
    NgIf,
    MatPaginatorModule,
    ToastrModule.forRoot({
      timeOut: 3000, 
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-bottom-right',
    })
  ],
  exports: [
    HttpClientModule,
    FontAwesomeModule,
    CommonModule,
    RouterModule,
    HeaderComponent,
    SpinnerComponent,
    NgbCollapseModule,
    FormsModule,
    ReactiveFormsModule,
    ImageUploadComponent,
    FormSpinnerComponent,
    ToastrModule,
    NotificationSpinnerComponent,
    NgbCarouselModule,
    NgIf,
    MatPaginatorModule,
    FooterComponent
  ],
})
export class SharedModule {
  constructor(config: NgbCarouselConfig) {
    config.interval = 20000;
    config.showNavigationIndicators = false;
  }
}
