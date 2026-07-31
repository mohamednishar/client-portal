import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom Validator ensuring at least one of 'department' or 'searchText' is specified.
 */
export const atLeastOneFieldRequiredValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const department = control.get('department')?.value;
  const searchText = control.get('searchText')?.value;

  const hasDept = !!(department && department.trim() !== '' && department !== 'ALL');
  const hasText = !!(searchText && searchText.trim() !== '');

  if (!hasDept && !hasText) {
    return { atLeastOneRequired: true };
  }

  return null;
};

/**
 * Custom Validator ensuring search text does not exceed 15 characters limit.
 */
export function maxSearchLengthValidator(maxLength: number = 15): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value && typeof value === 'string' && value.trim().length > maxLength) {
      return { maxSearchLength: { actual: value.trim().length, max: maxLength } };
    }
    return null;
  };
}
