import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable } from "@angular/core";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from "rxjs";
import { User } from "./user.model";
import { Router } from "@angular/router";

export interface AuthResponse {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    constructor(private http: HttpClient, private route: Router) {}
    
    expiredTimer: any;
    user = new BehaviorSubject<User>(null);

    signUp(email: string, password: string) {
        return this.http.post<AuthResponse>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDl1rNX5n5PY42cqI8GlyHCOSPUSWEExfc', 
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(res=>{
            this.handleAuthentication(res.email, res.localId, res.idToken, +res.expiresIn);
        }));
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponse>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDl1rNX5n5PY42cqI8GlyHCOSPUSWEExfc',
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(res=>{
            this.handleAuthentication(res.email, res.localId, res.idToken, +res.expiresIn);
        }));
    }

    handleError(errRes: HttpErrorResponse) {
        let errorMessage = "Unkown error eccured";
            if(!errRes.error || !errRes.error.error) {
                return throwError(() => new Error(errorMessage));               
            }

            switch (errRes.error.error.message) {
                case 'EMAIL_EXISTS':
                    errorMessage = "This email already exists";
                    break;
                case 'EMAIL_NOT_FOUND':
                    errorMessage = "This email doesn't exist";
                    break;
                case 'INVALID_PASSWORD':
                    errorMessage = "The password isn't correct";
                    break;
                default:
                    errorMessage = "Unkown error occured";
                    break;
            }

            return throwError(() => new Error(errorMessage));  
    }

    handleAuthentication(email: string, id: string, token: string, expiresIn: number) {
        const expireDate = new Date(new Date().getTime() + expiresIn * 1000);
        const userData = new User(email, id, token, expireDate);
        this.user.next(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        this.autoLogout(expiresIn * 1000);
    }

    logout() {
        this.user.next(null);
        localStorage.removeItem('userData');
        this.route.navigate(['/auth']);
        if (this.expiredTimer) {
            clearTimeout(this.expiredTimer);
        }
        this.expiredTimer = null;
    }

    autoLogin() {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _expirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));

        if(!userData) {return}

        const checkedUser = new User(userData.email, userData.id, userData._token, new Date(userData._expirationDate));

        if(checkedUser.token) {
            this.user.next(checkedUser);
            const remainingDuration = new Date(userData._expirationDate).getTime() - new Date().getTime();
            this.autoLogout(remainingDuration);
        }
    }

    autoLogout(expirationDuration: number) {
        this.expiredTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration) 
    }
}