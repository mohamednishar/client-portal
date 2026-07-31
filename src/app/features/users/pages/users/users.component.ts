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
  template: `
    <div class="container-fluid px-4 py-2">
      
      <!-- Header Banner -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 class="fw-bold text-dark mb-1">
            <i class="bi bi-people-fill text-client-primary me-2"></i>
            {{ 'USERS.TITLE' | translate }}
          </h3>
          <p class="text-muted m-0 small">{{ 'USERS.SUBTITLE' | translate }}</p>
        </div>

        <!-- Role Badge & DOB Visibility Notice -->
        <div class="d-flex align-items-center gap-2">
          <span class="badge p-2.5 rounded-pill shadow-sm" [class.bg-warning]="isSuperAdmin()" [class.text-dark]="isSuperAdmin()" [class.bg-info]="!isSuperAdmin()" [class.text-white]="!isSuperAdmin()">
            <i class="bi bi-shield-check me-1"></i>
            {{ 'USERS.ROLE_LABEL' | translate: { role: currentRole() } }}
          </span>
          <span *ngIf="isSuperAdmin()" class="badge bg-success p-2.5 rounded-pill shadow-sm">
            <i class="bi bi-eye-fill me-1"></i> {{ 'USERS.DOB_VISIBLE' | translate }}
          </span>
          <span *ngIf="!isSuperAdmin()" class="badge bg-secondary p-2.5 rounded-pill shadow-sm">
            <i class="bi bi-eye-slash-fill me-1"></i> {{ 'USERS.DOB_HIDDEN' | translate }}
          </span>
        </div>
      </div>

      <!-- Search & Filter Card (STEP 12) -->
      <div class="card card-theme p-4 mb-4 border-0">
        <h6 class="fw-bold text-muted mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-funnel-fill text-client-primary"></i>
          <span>{{ 'USERS.SEARCH_FORM.TITLE' | translate }}</span>
        </h6>

        <form [formGroup]="searchForm" novalidate>
          <div class="row g-3 align-items-end">
            
            <!-- Department Dropdown -->
            <div class="col-12 col-md-5 col-lg-4">
              <label for="departmentSelect" class="form-label fw-semibold small text-muted">
                {{ 'USERS.SEARCH_FORM.DEPARTMENT_LABEL' | translate }}
              </label>
              <select 
                id="departmentSelect" 
                formControlName="department" 
                class="form-select shadow-sm"
                [class.is-invalid]="hasFormError('atLeastOneRequired')">
                <option value="ALL">{{ 'COMMON.ALL_DEPARTMENTS' | translate }}</option>
                <option *ngFor="let dept of departments(); trackBy: trackByString" [value]="dept">
                  {{ dept }}
                </option>
              </select>
            </div>

            <!-- Search Text Input -->
            <div class="col-12 col-md-5 col-lg-5">
              <label for="searchInput" class="form-label fw-semibold small text-muted">
                {{ 'USERS.SEARCH_FORM.SEARCH_LABEL' | translate }} {{ 'USERS.SEARCH_FORM.MAX_CHARS_HINT' | translate: { count: 15 } }}
              </label>
              <div class="input-group shadow-sm">
                <span class="input-group-text bg-white text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  type="text" 
                  id="searchInput" 
                  formControlName="searchText" 
                  class="form-control"
                  [class.is-invalid]="hasSearchTextError('maxSearchLength') || hasFormError('atLeastOneRequired')"
                  [placeholder]="'USERS.SEARCH_FORM.SEARCH_PLACEHOLDER' | translate"
                  maxlength="20">
              </div>
              <div *ngIf="hasSearchTextError('maxSearchLength')" class="invalid-feedback d-block mt-1">
                {{ 'USERS.ERRORS.MAX_LENGTH_EXCEEDED' | translate }}
              </div>
            </div>

            <!-- Clear Filter Button -->
            <div class="col-12 col-md-2 col-lg-3 d-flex align-items-end" style="height: 100%;">
              <button 
                type="button" 
                class="btn btn-outline-secondary w-100 shadow-sm d-flex align-items-center justify-content-center gap-1 py-2"
                (click)="onResetFilter()"
                [disabled]="isDefaultFilter()">
                <i class="bi bi-x-circle"></i>
                <span>{{ 'USERS.SEARCH_FORM.CLEAR_BTN' | translate }}</span>
              </button>
            </div>

          </div>

          <!-- Cross-field Validation Alert -->
          <div *ngIf="hasFormError('atLeastOneRequired')" class="alert alert-warning py-2 px-3 mt-3 mb-0 d-flex align-items-center gap-2 small">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ 'USERS.ERRORS.AT_LEAST_ONE_REQUIRED' | translate }}</span>
          </div>
        </form>
      </div>

      <!-- Users Grid Bootstrap Table (STEP 13 & STEP 14) -->
      <div class="card card-theme border-0 overflow-hidden shadow-sm">
        <div class="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between border-bottom">
          <h6 class="fw-bold m-0 text-dark">
            <i class="bi bi-table me-2 text-client-primary"></i>
            <span>{{ 'USERS.TABLE.TITLE' | translate }}</span>
          </h6>
          <span class="badge bg-light text-dark border rounded-pill px-3 py-1 fw-semibold">
            {{ 'USERS.TABLE.SHOWING_COUNT' | translate: { shown: filteredUsersSignal().length, total: totalUsersCount() } }}
          </span>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-muted small text-uppercase fw-bold">
              <tr>
                <th scope="col" class="py-3 px-4">#</th>
                <th scope="col" class="py-3">{{ 'USERS.TABLE.FIRST_NAME' | translate }}</th>
                <th scope="col" class="py-3">{{ 'USERS.TABLE.LAST_NAME' | translate }}</th>
                <th scope="col" class="py-3">{{ 'USERS.TABLE.EMAIL' | translate }}</th>
                <!-- Role-Based Column rendering: DOB visible strictly for Super Admin (STEP 13) -->
                <th scope="col" class="py-3 text-client-primary" *ngIf="isSuperAdmin()">
                  <i class="bi bi-calendar-event me-1"></i>
                  {{ 'USERS.TABLE.DOB' | translate }} {{ 'USERS.TABLE.SUPER_ADMIN_ONLY' | translate }}
                </th>
                <th scope="col" class="py-3">{{ 'USERS.TABLE.DEPARTMENT' | translate }}</th>
                <th scope="col" class="py-3">{{ 'USERS.TABLE.ROLE' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsersSignal(); let idx = index; trackBy: trackByUserId" class="border-bottom">
                <td class="px-4 fw-semibold text-muted">{{ idx + 1 }}</td>
                <td class="fw-bold text-dark">{{ user.firstName }}</td>
                <td class="fw-medium">{{ user.lastName }}</td>
                <td>
                  <a [href]="'mailto:' + user.email" class="text-decoration-none text-client-primary fw-medium">
                    {{ user.email }}
                  </a>
                </td>
                <!-- Role-Based Cell rendering: DOB cell visible strictly for Super Admin -->
                <td *ngIf="isSuperAdmin()">
                  <span class="badge bg-light text-dark border px-2.5 py-1 font-monospace">
                    {{ user.dob }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">
                    {{ user.department }}
                  </span>
                </td>
                <td>
                  <span 
                    class="badge rounded-pill px-3 py-1" 
                    [class.bg-danger]="user.role === 'Super Admin'"
                    [class.bg-primary]="user.role === 'Admin'"
                    [class.bg-secondary]="user.role === 'User'">
                    {{ user.role }}
                  </span>
                </td>
              </tr>

              <!-- Empty State (STEP 19) -->
              <tr *ngIf="filteredUsersSignal().length === 0">
                <td [attr.colspan]="isSuperAdmin() ? 7 : 6" class="text-center py-5">
                  <div class="py-3 text-muted">
                    <i class="bi bi-search fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    <h6 class="fw-bold mb-1">{{ 'COMMON.NO_DATA' | translate }}</h6>
                    <p class="small text-muted m-0">{{ 'COMMON.NO_DATA_HINT' | translate }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
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
