import { useId } from 'react';

const supportedTypes = new Set(['text', 'email', 'tel', 'password', 'select', 'textarea', 'checkbox', 'file', 'number', 'date', 'search']);

// Pair a labeled form control with optional helper text and an accessible validation message.
export default function FormField({
  id,
  name,
  label,
  type = 'text',
  value,
  checked,
  options = [],
  hint,
  error,
  required = false,
  disabled = false,
  placeholder,
  autoComplete,
  accept,
  multiple = false,
  rows = 4,
  className = '',
  labelClassName = '',
  onChange,
  onBlur,
  ...nativeProps
}) {
  const reactId = useId().replaceAll(':', '');
  const fieldId = id ?? `form-field-${reactId}`;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const safeType = supportedTypes.has(type) ? type : 'text';
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  const controlProps = {
    ...nativeProps,
    'aria-describedby': describedBy,
    'aria-invalid': Boolean(error),
    autoComplete,
    disabled,
    id: fieldId,
    name,
    onBlur,
    onChange,
    required,
  };
  const fieldClasses = [
    'form-field',
    safeType === 'checkbox' ? 'form-field--checkbox' : '',
    error ? 'form-field--error' : '',
    className,
  ].filter(Boolean).join(' ');
  const labelClasses = ['form-field__label', labelClassName].filter(Boolean).join(' ');

  const labelContent = (
    <>
      {label}
      {required && <span aria-hidden="true" className="form-field__required">*</span>}
    </>
  );

  if (safeType === 'checkbox') {
    return (
      <div className={fieldClasses}>
        <div className="form-field__checkbox-row">
          <input {...controlProps} checked={checked ?? Boolean(value)} className="form-field__checkbox" type="checkbox" />
          <label className={labelClasses} htmlFor={fieldId}>{labelContent}</label>
        </div>
        {hint && <p className="form-field__hint" id={hintId}>{hint}</p>}
        {error && <p className="form-field__error" id={errorId}>{error}</p>}
      </div>
    );
  }

  return (
    <div className={fieldClasses}>
      <label className={labelClasses} htmlFor={fieldId}>{labelContent}</label>
      {safeType === 'select' ? (
        <select {...controlProps} className="form-field__control" value={value ?? ''}>
          <option value="">{placeholder ?? 'Choose an option'}</option>
          {options.map((option) => {
            const item = typeof option === 'string' ? { value: option, label: option } : option;
            return <option key={item.value} value={item.value}>{item.label}</option>;
          })}
        </select>
      ) : safeType === 'textarea' ? (
        <textarea
          {...controlProps}
          className="form-field__control form-field__textarea"
          placeholder={placeholder}
          rows={rows}
          value={value ?? ''}
        />
      ) : (
        <input
          {...controlProps}
          accept={safeType === 'file' ? accept : undefined}
          className="form-field__control"
          multiple={safeType === 'file' ? multiple : undefined}
          placeholder={placeholder}
          type={safeType}
          value={safeType === 'file' ? undefined : value ?? ''}
        />
      )}
      {hint && <p className="form-field__hint" id={hintId}>{hint}</p>}
      {error && <p className="form-field__error" id={errorId}>{error}</p>}
    </div>
  );
}
