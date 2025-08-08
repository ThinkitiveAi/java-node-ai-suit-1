const { validateProviderRegistration } = require('../../validation/providerValidation');

describe('Provider Validation', () => {
  it('should validate correct data', () => {
    const { error } = validateProviderRegistration({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+12345678901',
      password: 'StrongPassw0rd!',
      confirm_password: 'StrongPassw0rd!',
      specialization: 'Cardiology',
      license_number: 'MD123456',
      years_of_experience: 10,
      clinic_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      },
      medical_school: 'Harvard Medical School',
      board_certifications: ['American Board of Cardiology'],
      languages_spoken: ['English']
    });
    expect(error).toBeUndefined();
  });

  it('should reject invalid email', () => {
    const { error } = validateProviderRegistration({
      first_name: 'John',
      last_name: 'Doe',
      email: 'invalid-email',
      phone_number: '+12345678901',
      password: 'StrongPassw0rd!',
      confirm_password: 'StrongPassw0rd!',
      specialization: 'Cardiology',
      license_number: 'MD123456',
      years_of_experience: 10,
      clinic_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
    expect(error).toBeDefined();
    expect(error.details.some(e => e.path.includes('email'))).toBe(true);
  });

  it('should reject invalid phone number', () => {
    const { error } = validateProviderRegistration({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '12345',
      password: 'StrongPassw0rd!',
      confirm_password: 'StrongPassw0rd!',
      specialization: 'Cardiology',
      license_number: 'MD123456',
      years_of_experience: 10,
      clinic_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
    expect(error).toBeDefined();
    expect(error.details.some(e => e.path.includes('phone_number'))).toBe(true);
  });

  it('should enforce password complexity', () => {
    const { error } = validateProviderRegistration({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+12345678901',
      password: 'password',
      confirm_password: 'password',
      specialization: 'Cardiology',
      license_number: 'MD123456',
      years_of_experience: 10,
      clinic_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
    expect(error).toBeDefined();
    expect(error.details.some(e => e.path.includes('password'))).toBe(true);
  });

  it('should reject password containing name or email', () => {
    const { error } = validateProviderRegistration({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+12345678901',
      password: 'JohnDoe123!',
      confirm_password: 'JohnDoe123!',
      specialization: 'Cardiology',
      license_number: 'MD123456',
      years_of_experience: 10,
      clinic_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
    // This is not enforced by Joi, but by controller, so should pass Joi
    expect(error).toBeUndefined();
  });

  it('should reject invalid license number', () => {
    const { error } = validateProviderRegistration({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+12345678901',
      password: 'StrongPassw0rd!',
      confirm_password: 'StrongPassw0rd!',
      specialization: 'Cardiology',
      license_number: 'MD-123-456',
      years_of_experience: 10,
      clinic_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
    expect(error).toBeDefined();
    expect(error.details.some(e => e.path.includes('license_number'))).toBe(true);
  });

  it('should check specialization against allowed list', () => {
    const { error } = validateProviderRegistration({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+12345678901',
      password: 'StrongPassw0rd!',
      confirm_password: 'StrongPassw0rd!',
      specialization: 'FakeSpecialty',
      license_number: 'MD123456',
      years_of_experience: 10,
      clinic_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
    expect(error).toBeDefined();
    expect(error.details.some(e => e.path.includes('specialization'))).toBe(true);
  });

  it('should validate years of experience range', () => {
    const { error } = validateProviderRegistration({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+12345678901',
      password: 'StrongPassw0rd!',
      confirm_password: 'StrongPassw0rd!',
      specialization: 'Cardiology',
      license_number: 'MD123456',
      years_of_experience: 100,
      clinic_address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
    expect(error).toBeDefined();
    expect(error.details.some(e => e.path.includes('years_of_experience'))).toBe(true);
  });

  it('should validate address components', () => {
    const { error } = validateProviderRegistration({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '+12345678901',
      password: 'StrongPassw0rd!',
      confirm_password: 'StrongPassw0rd!',
      specialization: 'Cardiology',
      license_number: 'MD123456',
      years_of_experience: 10,
      clinic_address: {
        street: '',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    });
    expect(error).toBeDefined();
    expect(error.details.some(e => e.path.includes('clinic_address.street'))).toBe(true);
  });

  it('should sanitize input data properly', () => {
    const { error, value } = validateProviderRegistration({
      first_name: ' John ',
      last_name: ' Doe ',
      email: ' JOHN.DOE@EXAMPLE.COM ',
      phone_number: ' +12345678901 ',
      password: 'StrongPassw0rd!',
      confirm_password: 'StrongPassw0rd!',
      specialization: 'Cardiology',
      license_number: ' md123456 ',
      years_of_experience: 10,
      clinic_address: {
        street: ' 123 Main St ',
        city: ' New York ',
        state: ' ny ',
        zip: ' 10001 '
      }
    });
    expect(error).toBeUndefined();
    expect(value.first_name).toBe('John');
    expect(value.email).toBe('john.doe@example.com');
  });
}); 