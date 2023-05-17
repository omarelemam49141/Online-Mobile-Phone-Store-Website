import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastrService: ToastrService) { }

  productsAmountInCart = new Subject<number>();
  ordersAmount = new Subject<boolean>();

  public showSuccess(message): void {
    this.toastrService.success('Success!', message);
  }

  public showInfo(message): void {
    this.toastrService.info('Info!', message);
  }

  public showWarning(message): void {
    this.toastrService.warning('Warning!', message);
  }

  public showError(message): void {
    this.toastrService.error('Error!', message);
  }
}
