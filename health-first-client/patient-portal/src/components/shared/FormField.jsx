import React, { useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Phone,
  Email,
  Person,
  LocationOn
} from '@mui/icons-material';

const FormField = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  placeholder,
  disabled = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  autoComplete = 'off',
  options = [], // For select type
  multiline = false,
  rows = 1,
  maxLength,
  inputProps = {},
  sx = {},
  'aria-describedby': ariaDescribedBy,
  'data-testid': testId,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputIcon = () => {
    switch (type) {
      case 'email':
        return <Email color="action" />;
      case 'phone':
        return <Phone color="action" />;
      case 'text':
        if (name && (name.includes('name') || name.includes('Name'))) {
          return <Person color="action" />;
        }
        if (name && (name.includes('address') || name.includes('Address') || 
                     name.includes('city') || name.includes('state') || name.includes('zip'))) {
          return <LocationOn color="action" />;
        }
        return null;
      default:
        return null;
    }
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (event) => {
    const formattedValue = formatPhoneNumber(event.target.value);
    const syntheticEvent = {
      ...event,
      target: {
        ...event.target,
        value: formattedValue
      }
    };
    onChange(syntheticEvent);
  };

  const renderPasswordField = () => (
    <FormControl 
      variant={variant} 
      fullWidth={fullWidth} 
      error={!!error}
      disabled={disabled}
      required={required}
      sx={sx}
      data-testid={testId}
    >
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <OutlinedInput
        id={name}
        name={name}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy || (error ? `${name}-error` : undefined)}
        inputProps={{
          maxLength,
          ...inputProps
        }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleTogglePasswordVisibility}
              edge="end"
              tabIndex={-1}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
        {...props}
      />
      {(error || helperText) && (
        <FormHelperText id={`${name}-error`}>
          {error || helperText}
        </FormHelperText>
      )}
    </FormControl>
  );

  const renderSelectField = () => (
    <FormControl 
      variant={variant} 
      fullWidth={fullWidth} 
      error={!!error}
      disabled={disabled}
      required={required}
      sx={sx}
      data-testid={testId}
    >
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        label={label}
        aria-describedby={ariaDescribedBy || (error ? `${name}-error` : undefined)}
        {...props}
      >
        {options.map((option) => (
          <MenuItem 
            key={typeof option === 'object' ? option.value : option} 
            value={typeof option === 'object' ? option.value : option}
          >
            {typeof option === 'object' ? option.label : option}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && (
        <FormHelperText id={`${name}-error`}>
          {error || helperText}
        </FormHelperText>
      )}
    </FormControl>
  );

  const renderStandardField = () => {
    const inputIcon = getInputIcon();
    const isPhoneField = type === 'phone';
    const inputType = type === 'phone' ? 'tel' : type;
    
    return (
      <TextField
        id={name}
        name={name}
        label={label}
        type={inputType}
        value={value}
        onChange={isPhoneField ? handlePhoneChange : onChange}
        onBlur={onBlur}
        error={!!error}
        helperText={error || helperText}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        autoComplete={autoComplete}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        aria-describedby={ariaDescribedBy || (error ? `${name}-error` : undefined)}
        InputProps={{
          startAdornment: inputIcon ? (
            <InputAdornment position="start">
              {inputIcon}
            </InputAdornment>
          ) : undefined,
          inputProps: {
            maxLength,
            ...inputProps
          }
        }}
        sx={sx}
        data-testid={testId}
        {...props}
      />
    );
  };

  // Character count for fields with maxLength
  const renderCharacterCount = () => {
    if (!maxLength || !value) return null;
    
    const currentLength = value.length;
    const isNearLimit = currentLength > maxLength * 0.8;
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
        <Typography 
          variant="caption" 
          color={isNearLimit ? 'warning.main' : 'text.secondary'}
        >
          {currentLength}/{maxLength}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {type === 'password' && renderPasswordField()}
      {type === 'select' && renderSelectField()}
      {type !== 'password' && type !== 'select' && renderStandardField()}
      {maxLength && renderCharacterCount()}
    </Box>
  );
};

export default FormField; 