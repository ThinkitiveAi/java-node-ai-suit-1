import { useState, useCallback, useEffect } from 'react';

const useFormValidation = (initialValues = {}, validationRules = {}, options = {}) => {
  const {
    validateOnBlur = true,
    validateOnChange = false,
    validateOnSubmit = true,
    debounceMs = 300,
  } = options;

  // Form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [submitCount, setSubmitCount] = useState(0);

  // Debounce timer ref
  const debounceTimers = useState(new Map())[0];

  // Clear debounce timer for a field
  const clearDebounceTimer = useCallback((fieldName) => {
    if (debounceTimers.has(fieldName)) {
      clearTimeout(debounceTimers.get(fieldName));
      debounceTimers.delete(fieldName);
    }
  }, [debounceTimers]);

  // Validate a single field
  const validateField = useCallback((fieldName, value, allValues = values) => {
    const rule = validationRules[fieldName];
    if (!rule) return { isValid: true, message: '' };

    // If it's a function, call it with the value and all form values
    if (typeof rule === 'function') {
      return rule(value, allValues);
    }

    // If it's an object with validation function
    if (typeof rule === 'object' && rule.validate) {
      return rule.validate(value, allValues);
    }

    return { isValid: true, message: '' };
  }, [validationRules, values]);

  // Validate all fields
  const validateForm = useCallback((formValues = values) => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const result = validateField(fieldName, formValues[fieldName], formValues);
      if (!result.isValid) {
        newErrors[fieldName] = result.message;
        formIsValid = false;
      }
    });

    return { isValid: formIsValid, errors: newErrors };
  }, [validateField, validationRules, values]);

  // Update form validity whenever values or errors change
  useEffect(() => {
    const hasErrors = Object.keys(errors).some(key => errors[key]);
    setIsValid(!hasErrors);
  }, [errors]);

  // Handle field value change
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear any existing error for this field if user is typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validate on change if enabled
    if (validateOnChange || touched[name]) {
      // Clear existing debounce timer
      clearDebounceTimer(name);

      // Set new debounce timer
      const timer = setTimeout(() => {
        const result = validateField(name, fieldValue);
        if (!result.isValid) {
          setErrors(prev => ({
            ...prev,
            [name]: result.message
          }));
        }
      }, debounceMs);

      debounceTimers.set(name, timer);
    }
  }, [errors, validateOnChange, touched, validateField, clearDebounceTimer, debounceMs, debounceTimers]);

  // Handle field blur event
  const handleBlur = useCallback((event) => {
    const { name, value } = event.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur if enabled
    if (validateOnBlur) {
      clearDebounceTimer(name);
      
      const result = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: result.isValid ? '' : result.message
      }));
    }
  }, [validateOnBlur, validateField, clearDebounceTimer]);

  // Set a specific field value programmatically
  const setValue = useCallback((name, value, shouldValidate = false) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    if (shouldValidate) {
      const result = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: result.isValid ? '' : result.message
      }));
    }
  }, [validateField]);

  // Set multiple field values
  const setFormValues = useCallback((newValues, shouldValidate = false) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));

    if (shouldValidate) {
      const validation = validateForm({ ...values, ...newValues });
      setErrors(validation.errors);
    }
  }, [validateForm, values]);

  // Set field error manually
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Clear field error
  const clearFieldError = useCallback((name) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Reset form to initial state
  const resetForm = useCallback((newInitialValues = initialValues) => {
    setValues(newInitialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitCount(0);
    
    // Clear all debounce timers
    debounceTimers.forEach(timer => clearTimeout(timer));
    debounceTimers.clear();
  }, [initialValues, debounceTimers]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit) => {
    return async (event) => {
      if (event) {
        event.preventDefault();
      }

      setSubmitCount(prev => prev + 1);
      setIsSubmitting(true);

      try {
        // Validate form if enabled
        if (validateOnSubmit) {
          const validation = validateForm();
          setErrors(validation.errors);

          if (!validation.isValid) {
            // Mark all fields as touched to show errors
            const allFields = Object.keys(validationRules);
            const touchedState = {};
            allFields.forEach(field => {
              touchedState[field] = true;
            });
            setTouched(touchedState);
            
            setIsSubmitting(false);
            return { success: false, errors: validation.errors };
          }
        }

        // Call the submit handler
        const result = await onSubmit(values);
        
        if (result && result.success === false) {
          // Handle server-side validation errors
          if (result.errors) {
            setErrors(result.errors);
          }
          setIsSubmitting(false);
          return result;
        }

        setIsSubmitting(false);
        return { success: true, data: result };

      } catch (error) {
        console.error('Form submission error:', error);
        setIsSubmitting(false);
        return { 
          success: false, 
          error: error.message || 'An unexpected error occurred' 
        };
      }
    };
  }, [validateOnSubmit, validateForm, validationRules, values]);

  // Get field props for easy integration with form components
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: !!errors[name],
    helperText: errors[name] || '',
  }), [values, handleChange, handleBlur, errors]);

  // Check if field has been touched
  const isFieldTouched = useCallback((name) => touched[name], [touched]);

  // Check if field has error
  const hasFieldError = useCallback((name) => !!errors[name], [errors]);

  // Get all error messages as array
  const getErrorMessages = useCallback(() => {
    return Object.values(errors).filter(error => error);
  }, [errors]);

  // Check if form has any errors
  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    submitCount,

    // Event handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Utility functions
    setValue,
    setValues: setFormValues,
    setFieldError,
    clearFieldError,
    clearErrors,
    resetForm,
    validateField,
    validateForm,
    getFieldProps,

    // Helper functions
    isFieldTouched,
    hasFieldError,
    getErrorMessages,
    hasErrors,
  };
};

export default useFormValidation; 