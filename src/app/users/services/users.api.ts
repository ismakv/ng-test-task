import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, debounceTime, delay, finalize, map, of, switchMap, throwError } from 'rxjs'
import { ListRequest } from '../models/user/list-request';
import { UserListResponseDto } from '../models/user/list-response';
import { UserDto } from '../models/user/user';

@Injectable({ providedIn: 'root' })
export class UsersApi {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    
    private DB: UserDto[] = [
        { id: 'u1', user_name: 'Ivan Z.', is_active: true },
        { id: 'u2', user_name: 'Mikhail X.', is_active: true },
        { id: 'u3', user_name: 'Ivan C.', is_active: true },
        { id: 'u4', user_name: 'Petr V.', is_active: true },
        { id: 'u5', user_name: 'Artyom B.', is_active: true },
        { id: 'u6', user_name: 'Gleb N.', is_active: true },
        { id: 'u7', user_name: 'Anton M.', is_active: true },
        { id: 'u8', user_name: 'Semyon A.', is_active: true },
        { id: 'u9', user_name: 'Arseniy S.', is_active: true },
        { id: 'u10', user_name: 'Nick D.', is_active: true },
        { id: 'u11', user_name: 'Alex F.', is_active: true },
        { id: 'u12', user_name: 'Kirill G.', is_active: true },
        { id: 'u13', user_name: 'Stas H.', is_active: true },
        { id: 'u14', user_name: 'Yuriy J.', is_active: true },
        { id: 'u15', user_name: 'Roman K.', is_active: true },
        { id: 'u16', user_name: 'Ivan L.', is_active: true },
        { id: 'u17', user_name: 'Ivan Q.', is_active: true },
    ];

    getList(request: ListRequest): Observable<UserListResponseDto> {
        this.loadingSubject.next(true);
        return of(this.DB).pipe(
            delay(1000),
            switchMap(userArray =>
              this.filterUsers(userArray, request.search).pipe(
                map(filteredUsers => this.paginateUsers(filteredUsers, request)),
                map(paginatedUsers => ({
                  total_count: request.search
                    ? this.getFilteredTotalCount(this.DB, request.search)
                    : this.DB.length,
                  items: paginatedUsers,
                }))
              )
            ),
            finalize(() => {
              this.loadingSubject.next(false);
            })
          );
    }

    getById(id: string): Observable<UserDto> {
        return of(this.DB).pipe(
            switchMap(users => {
              const user = users.find(u => u.id === id);
              return user ? of(user) : throwError(() => new Error('User not found'));
            })
          );
    }

    remove(id: string): Observable<void> {
        const index = this.DB.findIndex(u => u.id === id);
        if (index !== -1) {
            this.DB.splice(index, 1);
            return of(undefined);
        } else {
            return throwError(() => new Error('User not found'));
        }
    }

    isLoading(): Observable<boolean> {
        return this.loadingSubject.asObservable();
    }

    private filterUsers(users: UserDto[], search?: string): Observable<UserDto[]> {
        return of(users).pipe(
          debounceTime(300),
          switchMap(userArray => {
            const filteredUsers = search
              ? userArray.filter(user => user.user_name.toLowerCase().includes(search.toLowerCase()))
              : userArray;
            return of(filteredUsers);
          })
        );
    }

    private getFilteredTotalCount(users: UserDto[], search: string): number {
        return users.filter(user => user.user_name.toLowerCase().includes(search.toLowerCase())).length;    
    }
    
    private paginateUsers(users: UserDto[], request: ListRequest): UserDto[] {
        const startIndex = (request.pageNumber - 1) * request.itemsPerPage;
        const endIndex = startIndex + request.itemsPerPage;

        return users.slice(startIndex, endIndex);
    }
}





