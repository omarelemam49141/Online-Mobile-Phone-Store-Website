import { AfterViewInit, Component, ElementRef, HostBinding, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { CartService } from 'src/app/cart/services/cart.service';
import { ModeService } from '../services/mode.service';
import { NotificationService } from '../services/notification.service';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { faCircleXmark, faChevronDown, faUserTie, faCartShopping, faSearch, faStore } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { FilterService } from '../services/filter.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit{
  constructor(private router: ActivatedRoute , private route: Router, private filterService: FilterService ,private authService: AuthService, private renderer: Renderer2, private offcanvasService: NgbOffcanvas, private modeService: ModeService, private notificationService: NotificationService, private cartService: CartService, private modalService: NgbModal) {
    
  }
  isAuth = false;
  private userSub: Subscription;

  closeIcon = faCircleXmark;
  downArrow = faChevronDown;
  login = faUserTie;
  cart = faCartShopping;
  search = faSearch;
  storeIcon = faStore;
  currentLanguage = 'arabic';

  searchValue = '';
  searchCloseInput = true;
  searchCloseDiv = true;

  lang = 'fi-eg';
  isCollapsed = true;
  user = true;
  cartTitle = 'Cart';
  productsAmount: number = null;
  newOrdersAmount:number = null;
  ordersCount = null;
  notificationLoading = false;
  arabicFont = "'Cairo', sans-serif";
  @ViewChild('howItWorks', {static: false}) guideModal; 

  @HostBinding("style.--font") font: string = '';
  @HostBinding("style.--font2") font2: string = '';

  
  searchingStatus() {
    if (this.searchValue == '' ||  this.searchValue.replace(/\s/g, '') == '' || (this.searchCloseInput == true && this.searchCloseDiv == true)) {
      return 'none';
    } else {
      return 'block'
    }
  }

  changeMode(user: boolean) {
    this.user = user;
    this.cartTitle = this.user ? 'Cart' : 'Orders';
    localStorage.setItem('mode', JSON.stringify(this.user ? 'user' : 'admin'));
    this.modeService.setMode(JSON.parse(localStorage.getItem('mode')));
  }

  ngAfterViewInit(): void {
    
  }

  changeLang(language) {
    this.lang = language;
    if (language == 'fi-eg') {
      this.currentLanguage = 'arabic';
    } else if (language == 'fi-us') {
      this.currentLanguage = 'english';
    }
    this.modeService.setLanguage(this.currentLanguage);
    this.isCollapsed = true;

  }

  ngOnInit(): void {
    this.setCurrentLanguage(this.currentLanguage);

    this.userSub = this.authService.user.subscribe(user => {
      this.isAuth = !!user;
    })

    this.modeService.language.subscribe({
      next: (res) => {
        this.setCurrentLanguage(res);
      },

      error: (e) => {
        this.notificationService.showError('Something went wrong');
      }
    })

    this.getNewOrdersCount();

    this.notificationService.ordersAmount.subscribe({
      next: (res) => {
        this.getNewOrdersCount();
      },

      error: (e) => {
        this.notificationService.showError(e.message);
      }
    })

    if (localStorage.getItem('language')) {
      this.setCurrentLanguage(JSON.parse(localStorage.getItem('language')));
    }

    if (JSON.parse(localStorage.getItem('cart')) && JSON.parse(localStorage.getItem('cart')).length != 0) {
      this.productsAmount = JSON.parse(localStorage.getItem('cart')).length;
    } else {
      this.productsAmount = null;
    }

    this.notificationService.productsAmountInCart.subscribe({
      next: (v) => {
        this.productsAmount = v;
      },
      error: (e) => {
        this.notificationService.showError("Can't show notifications");
      }
    })
  }

  setCurrentLanguage(myLang) {
    this.currentLanguage = myLang;
    if (this.currentLanguage == 'english') {
      this.font = "'Raleway', sans-serif";
      this.font2 = "'Changa', sans-serif";
      this.lang = 'fi-us';
    } else if (this.currentLanguage = 'arabic'){
      this.font = this.arabicFont;
      this.font2 = this.arabicFont;
      this.lang = 'fi-eg';
    }
  }

  getNewOrdersCount() {
    this.cartService.getAllCartsCount('pending').subscribe({
      next: (res: any) => {
        this.newOrdersAmount = res.dataLength;
      },
      error: (e) => {
        this.notificationService.showError("Can't show notifications");
      }
    });
  }

  viewAll(categoryName, subTitle, subCategory) {
    this.filterService.applyCategory(categoryName, subTitle, subCategory);
    this.route.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  onLogOut() {
      this.authService.logout();
  }

  openScroll(content: TemplateRef<any>) {
    if (this.currentLanguage == 'english') {
      this.offcanvasService.open(content, { scroll: true });
    } else if (this.currentLanguage == 'arabic') {
      this.offcanvasService.open(content, { scroll: true, position: 'end' });
    }
	}

  showCategoryDetails(list) {
    document.getElementById(list).style.display = 'block';
  }

  hideCategoryDetails(list) {
    document.getElementById(list).style.display = 'none';
  }

  openMenuList(listId) {
    if (document.getElementById(listId).style.display == 'block') {
      document.getElementById(listId).style.display = 'none';
    } else {
      document.getElementById(listId).style.display = 'block'
    }

    let arrow:HTMLElement = document.querySelector('#' + listId + '-trigger svg') as HTMLElement;
    
    arrow.style.transition = 'all 0.3s';

    if (arrow.style.transform == 'rotate(180deg)') {
      arrow.style.transform = 'rotate(0deg)';
    } else {
      arrow.style.transform = 'rotate(180deg)'
    }
  }

  searching() {
    this.filterService.applySearch(this.searchValue);
  }
}
