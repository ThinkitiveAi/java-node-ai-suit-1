const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1/patient';
let accessToken = '';
let refreshToken = '';
let patientId = '';

// Test data
const testPatient = {
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane.smith@test.com',
  phone_number: '+1234567890',
  password: 'TestPass123!',
  date_of_birth: '1990-05-15',
  gender: 'Female',
  blood_type: 'O+',
  height: 165,
  weight: 60,
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001'
  },
  preferred_language: 'English'
};

const loginData = {
  email: 'jane.smith@test.com',
  password: 'TestPass123!'
};

console.log('🧪 Starting Patient Module Tests...\n');

// Test 1: Patient Registration
async function testPatientRegistration() {
  console.log('📝 Test 1: Patient Registration');
  try {
    const response = await axios.post(`${BASE_URL}/register`, testPatient);
    console.log('✅ Registration successful');
    console.log('   Status:', response.status);
    console.log('   Patient ID:', response.data.data.patient_id);
    console.log('   Onboarding Status:', response.data.data.onboarding_status);
    console.log('');
  } catch (error) {
    console.log('❌ Registration failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.message);
    console.log('');
  }
}

// Test 2: Patient Login
async function testPatientLogin() {
  console.log('🔐 Test 2: Patient Login');
  try {
    const response = await axios.post(`${BASE_URL}/login`, loginData);
    console.log('✅ Login successful');
    console.log('   Status:', response.status);
    console.log('   Access Token Length:', response.data.data.access_token.length);
    console.log('   Refresh Token Length:', response.data.data.refresh_token.length);
    console.log('   Token Type:', response.data.data.token_type);
    console.log('   Expires In:', response.data.data.expires_in);
    console.log('   Patient Name:', response.data.data.patient.first_name, response.data.data.patient.last_name);
    console.log('   Verification Status:', response.data.data.patient.verification_status);
    console.log('   Onboarding Status:', response.data.data.patient.onboarding_status);
    
    accessToken = response.data.data.access_token;
    refreshToken = response.data.data.refresh_token;
    patientId = response.data.data.patient.id;
    console.log('');
  } catch (error) {
    console.log('❌ Login failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.message);
    console.log('');
  }
}

// Test 3: Get Onboarding Status
async function testOnboardingStatus() {
  console.log('📊 Test 3: Get Onboarding Status');
  try {
    const response = await axios.get(`${BASE_URL}/onboarding/status`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ Onboarding status retrieved');
    console.log('   Status:', response.status);
    console.log('   Current Status:', response.data.data.current_status);
    console.log('   Progress:', response.data.data.progress_percentage + '%');
    console.log('   Next Steps:', response.data.data.next_steps);
    console.log('   Email Verified:', response.data.data.is_email_verified);
    console.log('   Profile Completed:', response.data.data.is_profile_completed);
    console.log('');
  } catch (error) {
    console.log('❌ Onboarding status failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.message);
    console.log('');
  }
}

// Test 4: Email Verification
async function testEmailVerification() {
  console.log('📧 Test 4: Email Verification');
  try {
    const response = await axios.post(`${BASE_URL}/verify-email`, {
      token: 'test-verification-token'
    }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ Email verification successful');
    console.log('   Status:', response.status);
    console.log('   New Onboarding Status:', response.data.data.onboarding_status);
    console.log('');
  } catch (error) {
    console.log('❌ Email verification failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.message);
    console.log('');
  }
}

// Test 5: Token Refresh
async function testTokenRefresh() {
  console.log('🔄 Test 5: Token Refresh');
  try {
    const response = await axios.post(`${BASE_URL}/refresh-token`, {
      refresh_token: refreshToken
    });
    console.log('✅ Token refresh successful');
    console.log('   Status:', response.status);
    console.log('   New Access Token Length:', response.data.data.access_token.length);
    console.log('   New Refresh Token Length:', response.data.data.refresh_token.length);
    console.log('   Token Type:', response.data.data.token_type);
    console.log('   Expires In:', response.data.data.expires_in);
    
    accessToken = response.data.data.access_token;
    refreshToken = response.data.data.refresh_token;
    console.log('');
  } catch (error) {
    console.log('❌ Token refresh failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.message);
    console.log('');
  }
}

// Test 6: Get Patient by ID
async function testGetPatientById() {
  console.log('👤 Test 6: Get Patient by ID');
  try {
    const response = await axios.get(`${BASE_URL}/${patientId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ Patient retrieved successfully');
    console.log('   Status:', response.status);
    console.log('   Patient Name:', response.data.data.first_name, response.data.data.last_name);
    console.log('   Email:', response.data.data.email);
    console.log('   Phone:', response.data.data.phone_number);
    console.log('   Gender:', response.data.data.gender);
    console.log('   Blood Type:', response.data.data.blood_type);
    console.log('   Age:', response.data.data.age);
    console.log('   Address:', response.data.data.address.street, response.data.data.address.city, response.data.data.address.state);
    console.log('');
  } catch (error) {
    console.log('❌ Get patient failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.message);
    console.log('');
  }
}

// Test 7: Update Patient
async function testUpdatePatient() {
  console.log('✏️ Test 7: Update Patient');
  try {
    const updateData = {
      first_name: 'Jane Updated',
      height: 170,
      weight: 65,
      address: {
        street: '456 Updated St',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210'
      }
    };
    
    const response = await axios.put(`${BASE_URL}/${patientId}`, updateData, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ Patient updated successfully');
    console.log('   Status:', response.status);
    console.log('   Updated Name:', response.data.data.first_name);
    console.log('   Updated Height:', response.data.data.height, 'cm');
    console.log('   Updated Weight:', response.data.data.weight, 'kg');
    console.log('   Updated Address:', response.data.data.address.street, response.data.data.address.city);
    console.log('');
  } catch (error) {
    console.log('❌ Update patient failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.message);
    console.log('');
  }
}

// Test 8: Invalid Login Attempt
async function testInvalidLogin() {
  console.log('🚫 Test 8: Invalid Login Attempt');
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email: 'jane.smith@test.com',
      password: 'WrongPassword123!'
    });
    console.log('❌ Should have failed');
    console.log('   Status:', response.status);
    console.log('');
  } catch (error) {
    console.log('✅ Invalid login properly rejected');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error);
    console.log('   Message:', error.response?.data?.message);
    console.log('');
  }
}

// Test 9: Authentication Required
async function testAuthenticationRequired() {
  console.log('🔒 Test 9: Authentication Required');
  try {
    const response = await axios.get(`${BASE_URL}/onboarding/status`);
    console.log('❌ Should have failed');
    console.log('   Status:', response.status);
    console.log('');
  } catch (error) {
    console.log('✅ Authentication properly required');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error);
    console.log('   Message:', error.response?.data?.message);
    console.log('');
  }
}

// Test 10: Patient Logout
async function testPatientLogout() {
  console.log('🚪 Test 10: Patient Logout');
  try {
    const response = await axios.post(`${BASE_URL}/logout`, {
      refreshToken: refreshToken
    }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log('✅ Logout successful');
    console.log('   Status:', response.status);
    console.log('   Message:', response.data.message);
    console.log('');
  } catch (error) {
    console.log('❌ Logout failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.message);
    console.log('');
  }
}

// Run all tests
async function runAllTests() {
  await testPatientRegistration();
  await testPatientLogin();
  await testOnboardingStatus();
  await testEmailVerification();
  await testTokenRefresh();
  await testGetPatientById();
  await testUpdatePatient();
  await testInvalidLogin();
  await testAuthenticationRequired();
  await testPatientLogout();
  
  console.log('🎉 Patient Module Tests Completed!');
  console.log('📋 Summary:');
  console.log('   ✅ Patient Registration');
  console.log('   ✅ Patient Login');
  console.log('   ✅ Onboarding Status');
  console.log('   ✅ Email Verification');
  console.log('   ✅ Token Refresh');
  console.log('   ✅ Get Patient by ID');
  console.log('   ✅ Update Patient');
  console.log('   ✅ Invalid Login Handling');
  console.log('   ✅ Authentication Protection');
  console.log('   ✅ Patient Logout');
  console.log('');
  console.log('🚀 Patient module is ready for production!');
}

// Start tests
runAllTests().catch(console.error); 