import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

/**
 * Validador personalizado para los campos de precio y tipo de precio.
 * Requiere que ambos campos (precio y tipo) tengan valor, o que ambos estén vacíos.
 */
export const priceFilterValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const priceControl = control.get('price');
  const priceFilterTypeControl = control.get('price_filter_type');

  const priceHasValue = priceControl?.value !== undefined && priceControl?.value !== null && priceControl?.value.toString().trim() !== '';
  const typeHasValue = !!priceFilterTypeControl?.value;

  if (!priceHasValue && !typeHasValue) {
    priceControl?.setErrors(null);
    priceFilterTypeControl?.setErrors(null);
    return null;
  }

  if (priceHasValue !== typeHasValue) {
    if (priceHasValue && !typeHasValue) {
      priceFilterTypeControl?.setErrors({ priceTypeRequired: true });
      priceControl?.setErrors(null);
    } else { 
      priceControl?.setErrors({ priceRequired: true });
      priceFilterTypeControl?.setErrors(null);
    }
    return { priceFilterIncomplete: true };
  }
  priceControl?.setErrors(null);
  priceFilterTypeControl?.setErrors(null);
  return null;
};