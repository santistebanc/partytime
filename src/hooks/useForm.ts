import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules
) => {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false
  });

  const validateField = useCallback((name: keyof T, value: any): string | null => {
    if (!validationRules || !validationRules[name as string]) {
      return null;
    }

    const rule = validationRules[name as string];
    
    if (rule.required && (!value || value.toString().trim() === '')) {
      return 'This field is required';
    }

    if (rule.minLength && value && value.toString().length < rule.minLength) {
      return `Minimum length is ${rule.minLength} characters`;
    }

    if (rule.maxLength && value && value.toString().length > rule.maxLength) {
      return `Maximum length is ${rule.maxLength} characters`;
    }

    if (rule.pattern && value && !rule.pattern.test(value.toString())) {
      return 'Invalid format';
    }

    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [validationRules]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const newErrors = { ...prev.errors };
      const newTouched = { ...prev.touched, [name]: true };

      // Validate the field
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }

      // Check if form is valid
      const isValid = Object.keys(newErrors).length === 0;

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        touched: newTouched,
        isValid
      };
    });
  }, [validateField]);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false
    }));
  }, []);

  const setFieldTouched = useCallback((name: keyof T, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched }
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!validationRules) {
      return true;
    }

    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(validationRules).forEach(key => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, state.values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setState(prev => ({
      ...prev,
      errors: newErrors,
      isValid: Object.keys(newErrors).length === 0
    }));

    return Object.keys(newErrors).length === 0;
  }, [validationRules, validateField, state.values]);

  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false
    });
  }, [initialValues]);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const getFieldProps = useCallback((name: keyof T) => ({
    value: state.values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      setFieldValue(name, e.target.value),
    onBlur: () => setFieldTouched(name, true),
    error: state.errors[name],
    touched: state.touched[name]
  }), [state.values, state.errors, state.touched, setFieldValue, setFieldTouched]);

  return {
    ...state,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateForm,
    resetForm,
    setSubmitting,
    getFieldProps
  };
};
