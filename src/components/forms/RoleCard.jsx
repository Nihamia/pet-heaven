import { useId } from 'react';
import { roleFieldOptions } from '../../data/roles.js';
import Card from '../ui/Card.jsx';
import FormField from './FormField.jsx';

function AvailabilityDays({ field, value, error, onChange, onBlur }) {
  const errorId = `${useId()}-error`;
  function updateDay(day, checked) {
    const next = checked ? [...value, day] : value.filter((selected) => selected !== day);
    onChange({ target: { name: field.name, value: next } });
  }

  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="role-card__days">
      <legend>{field.label} <span aria-hidden="true" className="form-field__required">*</span></legend>
      <div className="role-card__day-options">
        {field.options.map((day) => (
          <FormField checked={value.includes(day)} key={day} label={day} name={field.name} onBlur={onBlur} onChange={(event) => updateDay(day, event.target.checked)} type="checkbox" />
        ))}
      </div>
      {error && <p className="form-field__error" id={errorId}>{error}</p>}
    </fieldset>
  );
}

// Keep role selection and its relevant follow-up questions together.
export default function RoleCard({ role, values, fieldError, onChange, onBlur, pets }) {
  const selected = Boolean(values[role.selectionField]);
  return (
    <Card as="div" className={`role-card${selected ? ' role-card--selected' : ''}`}>
      <div className="role-card__choice">
        <span aria-hidden="true" className="role-icon">{role.icon}</span>
        <FormField checked={selected} hint={role.summary} label={role.selectionLabel} name={role.selectionField} onBlur={onBlur} onChange={onChange} type="checkbox" />
      </div>
      {selected && role.fields.length > 0 && (
        <fieldset className="role-card__fields">
          <legend>{role.selectionLabel} details</legend>
          {role.fields.map((field) => field.type === 'days' ? (
            <AvailabilityDays error={fieldError(field.name)} field={field} key={field.name} onBlur={onBlur} onChange={onChange} value={values[field.name]} />
          ) : (
            <FormField
              error={fieldError(field.name)} hint={field.hint} key={field.name} label={field.label}
              max={field.max} maxLength={field.maxLength} min={field.min} name={field.name}
              onBlur={onBlur} onChange={onChange} options={roleFieldOptions(field, pets)} required={field.required}
              rows={3} type={field.type === 'pet' ? 'select' : field.type} value={values[field.name]}
            />
          ))}
        </fieldset>
      )}
    </Card>
  );
}
