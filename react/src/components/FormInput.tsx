// src/components/FormInput.tsx
import React from 'react';

interface FormInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  required,
  suggestions = [],
  onSuggestionClick,
  error,
  disabled,
  onBlur,
}) => {
  return (
    <div className="form-group row position-relative">
      <label className="col-12 col-md-2 col-form-label">
        {label}
        {required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <div className="col-12 col-md-10 position-relative">
        <input
          type="text"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
        />
  
        {suggestions.length > 0 && !disabled && (
          <ul
            className="list-group position-absolute w-100"
            style={{ zIndex: 1000, marginTop: '0.25rem' }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="list-group-item list-group-item-action"
                onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                style={{ cursor: 'pointer' }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
  
        {error && (
          <p className="text-danger mt-1 mb-1" style={{ marginBottom: '0.25rem' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default FormInput;
