import { TestBed } from '@angular/core/testing';

import { MyLanguageService } from './my-language.service';

describe('MyLanguageService', () => {
  let service: MyLanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyLanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
