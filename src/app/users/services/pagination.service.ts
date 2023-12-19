import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PaginationService {
  private currentPageSubject = new BehaviorSubject<number>(1);

  constructor() {}

  setCurrentPage(page: number) {
    this.currentPageSubject.next(page);
  }

  getCurrentPage(): Observable<number> {
    return this.currentPageSubject.asObservable();
  }

  getPages(totalItems: number, itemsPerPage: number): Observable<number[]> {
    return this.calculateTotalPages(totalItems, itemsPerPage).pipe(
      switchMap((totalPages) =>
        this.getCurrentPage().pipe(
          tap((currentPage) => {
            if (currentPage > totalPages) {
              this.setCurrentPage(1);
            }
          }),
          map(() => Array.from({ length: totalPages }, (_, index) => index + 1))
        )
      )
    );
  }

  private calculateTotalPages(totalItems: number, itemsPerPage: number): Observable<number> {
    return of(Math.ceil(totalItems / itemsPerPage));
  }
}