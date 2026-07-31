import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ClientService } from '../../../../core/services/client.service';
import { User } from '../../../../core/models/user.model';
import { atLeastOneFieldRequiredValidator, maxSearchLengthValidator } from '../../../../shared/validators/custom-search.validator';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private destroy$ = new Subject<void>();

  public searchForm!: FormGroup;
  public filteredUsersSignal = signal<User[]>([]);

  public currentRole = this.authService.currentRoleSignal;
  public isSuperAdmin = () => this.authService.isSuperAdmin();

  public departments = () => this.clientService.getDepartments();
  public totalUsersCount = computed(() => this.clientService.getUsers().length);

  ngOnInit(): void {
    this.initSearchForm();
    this.initSearchPipeline();
    this.applyFilter(this.searchForm.value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSearchForm(): void {
    this.searchForm = this.fb.group({
      department: ['ALL'],
      searchText: ['', [maxSearchLengthValidator(15)]]
    }, { validators: [atLeastOneFieldRequiredValidator] });
  }

  private initSearchPipeline(): void {
    this.searchForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntil(this.destroy$)
    ).subscribe((formValue) => {
      this.applyFilter(formValue);
    });
  }

  private applyFilter(formValue: { department: string; searchText: string }): void {
    const allUsers = this.clientService.getUsers();
    const dept = formValue.department;
    const text = (formValue.searchText || '').trim().toLowerCase();

    // If max search length error or invalid, do not throw, filter gracefully
    if (this.hasSearchTextError('maxSearchLength')) {
      return;
    }

    let result = [...allUsers];

    if (dept && dept !== 'ALL') {
      result = result.filter(u => u.department === dept);
    }

    if (text) {
      result = result.filter(u => 
        u.firstName.toLowerCase().includes(text) ||
        u.lastName.toLowerCase().includes(text) ||
        u.email.toLowerCase().includes(text)
      );
    }

    this.filteredUsersSignal.set(result);
  }

  public hasFormError(errorName: string): boolean {
    return !!(this.searchForm.hasError(errorName) && (this.searchForm.dirty || this.searchForm.touched));
  }

  public hasSearchTextError(errorName: string): boolean {
    const control = this.searchForm.get('searchText');
    return !!(control && control.hasError(errorName));
  }

  public isDefaultFilter(): boolean {
    const val = this.searchForm.value;
    return (val.department === 'ALL' || !val.department) && (!val.searchText || val.searchText.trim() === '');
  }

  public onResetFilter(): void {
    this.searchForm.patchValue({
      department: 'ALL',
      searchText: ''
    });
    this.searchForm.markAsPristine();
    this.searchForm.markAsUntouched();
    this.applyFilter(this.searchForm.value);
  }

  public trackByUserId(index: number, user: User): string {
    return user.id;
  }

  public trackByString(index: number, item: string): string {
    return item;
  }
}
