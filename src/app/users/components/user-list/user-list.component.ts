import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { ListRequest } from '../../models/user/list-request';
import { UserListResponseDto } from '../../models/user/list-response';
import { PaginationService } from '../../services/pagination.service';
import { UsersApi } from '../../services/users.api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  userList$!: Observable<UserListResponseDto>;
  pages$!: Observable<number[]>;
  isLoading$ = this.usersService.isLoading();
  pageSizeOptions = [5, 10, 20];
  searchForm!: FormGroup;
  paginationForm!: FormGroup;
  viewType: 'card' | 'row' = 'card';

  get currentPage() {
    return this.paginationService.getCurrentPage();
  }

  constructor(
    private readonly usersService: UsersApi,
    private readonly paginationService: PaginationService,
    private readonly fb: FormBuilder,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      search: [''],
    });

    this.paginationForm = this.fb.group({
      itemsPerPage: [5],
    });

    this.loadUsers();

    this.searchForm.get('search')!.valueChanges.pipe(
      startWith({ search: '' }),
      debounceTime(300), 
    ).subscribe(i => this.onSearchChange);
  }

  onPageChange(page: number) {
    this.paginationService.setCurrentPage(page);
  }

  onPageSizeChange() {
    this.paginationService.setCurrentPage(1);
  }

  deleteUser(id: string) {
    this.usersService.remove(id).subscribe(() => {
      this.loadUsers();
    });
  }

  toggleView() {
    switch(this.viewType) {
      case 'card':
        this.viewType = 'row';
        break;
      case 'row':
        this.viewType = 'card';
        break;
      default: 
        this.viewType = 'card';
    }
  }

  private onSearchChange() {
    this.paginationService.setCurrentPage(1);
  }

  private loadUsers() {
    this.paginationService.getCurrentPage().subscribe((currentPage) => {
      const listRequest: ListRequest = {
        pageNumber: currentPage,
        itemsPerPage: this.paginationForm.get('itemsPerPage')!.value,
        search: this.searchForm.get('search')!.value,
      };
  
      this.userList$ = this.usersService.getList(listRequest).pipe(
        tap(i => {
          this.pages$ = this.paginationService.getPages(i.total_count, this.paginationForm.get('itemsPerPage')!.value);
          this.cd.detectChanges();
        })
      );
    });
  }
}
