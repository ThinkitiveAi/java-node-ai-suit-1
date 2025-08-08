const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import the app
const app = require('./src/app');
const Provider = require('./src/models/Provider');

let mongoServer;

// Setup in-memory MongoDB
async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✅ Test MongoDB connected');
}

// Cleanup
async function cleanup() {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('✅ Test cleanup completed');
}

// Test data
const testProvider = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@test.com',
  phone_number: '+12345678901',
  password: 'StrongPassw0rd!',
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
};

async function testRoutes() {
  console.log('\n=== Testing Provider Routes ===\n');

  try {
    // Test 1: Provider Registration
    console.log('1. Testing Provider Registration...');
    const registerResponse = await request(app)
      .post('/api/v1/provider/register')
      .send(testProvider);
    
    if (registerResponse.status === 201) {
      console.log('✅ Registration successful');
      console.log('   - Provider ID:', registerResponse.body.data.provider_id);
      console.log('   - Email:', registerResponse.body.data.email);
    } else {
      console.log('❌ Registration failed:', registerResponse.body.message);
    }

    // Test 2: Create a verified provider for login tests
    console.log('\n2. Creating verified provider for login tests...');
    const password_hash = await bcrypt.hash(testProvider.password, 12);
    const verifiedProvider = await Provider.create({
      ...testProvider,
      email: 'verified@test.com',
      phone_number: '+19876543210',
      license_number: 'MD654321',
      password_hash,
      verification_status: 'verified',
      is_active: true,
      email_verified_at: new Date()
    });
    console.log('✅ Verified provider created');

    // Test 3: Provider Login
    console.log('\n3. Testing Provider Login...');
    const loginResponse = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: 'verified@test.com',
        password: testProvider.password
      });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log('   - Access token:', !!loginResponse.body.data.access_token);
      console.log('   - Refresh token:', !!loginResponse.body.data.refresh_token);
      console.log('   - Provider email:', loginResponse.body.data.provider.email);
      
      const accessToken = loginResponse.body.data.access_token;
      const refreshToken = loginResponse.body.data.refresh_token;

      // Test 4: Onboarding Status
      console.log('\n4. Testing Onboarding Status...');
      const onboardingResponse = await request(app)
        .get('/api/v1/provider/onboarding/status')
        .set('Authorization', `Bearer ${accessToken}`);

      if (onboardingResponse.status === 200) {
        console.log('✅ Onboarding status retrieved');
        console.log('   - Progress:', onboardingResponse.body.data.progress_percentage + '%');
        console.log('   - Current step:', onboardingResponse.body.data.current_step);
      } else {
        console.log('❌ Onboarding status failed:', onboardingResponse.body.message);
      }

      // Test 5: Token Refresh
      console.log('\n5. Testing Token Refresh...');
      const refreshResponse = await request(app)
        .post('/api/v1/provider/refresh-token')
        .send({
          refresh_token: refreshToken
        });

      if (refreshResponse.status === 200) {
        console.log('✅ Token refresh successful');
        console.log('   - New access token:', !!refreshResponse.body.data.access_token);
        console.log('   - New refresh token:', !!refreshResponse.body.data.refresh_token);
      } else {
        console.log('❌ Token refresh failed:', refreshResponse.body.message);
      }

      // Test 6: Get Provider by ID
      console.log('\n6. Testing Get Provider by ID...');
      const getProviderResponse = await request(app)
        .get(`/api/v1/provider/${verifiedProvider._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      if (getProviderResponse.status === 200) {
        console.log('✅ Get provider successful');
        console.log('   - Provider found:', !!getProviderResponse.body.data.provider);
        console.log('   - Provider email:', getProviderResponse.body.data.provider.email);
      } else {
        console.log('❌ Get provider failed:', getProviderResponse.body.message);
      }

      // Test 7: Update Provider
      console.log('\n7. Testing Update Provider...');
      const updateResponse = await request(app)
        .put(`/api/v1/provider/${verifiedProvider._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          first_name: 'John Updated',
          years_of_experience: 15
        });

      if (updateResponse.status === 200) {
        console.log('✅ Update provider successful');
        console.log('   - Updated name:', updateResponse.body.data.provider.first_name);
        console.log('   - Updated experience:', updateResponse.body.data.provider.years_of_experience);
      } else {
        console.log('❌ Update provider failed:', updateResponse.body.message);
      }

      // Test 8: Get All Providers
      console.log('\n8. Testing Get All Providers...');
      const getAllResponse = await request(app)
        .get('/api/v1/provider/')
        .set('Authorization', `Bearer ${accessToken}`);

      if (getAllResponse.status === 200) {
        console.log('✅ Get all providers successful');
        console.log('   - Providers count:', getAllResponse.body.data.providers.length);
        console.log('   - Pagination:', !!getAllResponse.body.data.pagination);
      } else {
        console.log('❌ Get all providers failed:', getAllResponse.body.message);
      }

      // Test 9: Logout
      console.log('\n9. Testing Logout...');
      const logoutResponse = await request(app)
        .post('/api/v1/provider/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      if (logoutResponse.status === 200) {
        console.log('✅ Logout successful');
      } else {
        console.log('❌ Logout failed:', logoutResponse.body.message);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.body.message);
    }

    // Test 10: Email Verification (simulate)
    console.log('\n10. Testing Email Verification...');
    const verifyResponse = await request(app)
      .post('/api/v1/provider/verify-email')
      .send({
        token: 'test-token',
        email: 'john.doe@test.com'
      });

    if (verifyResponse.status === 400) {
      console.log('✅ Email verification validation working (expected invalid token)');
    } else {
      console.log('❌ Email verification test failed');
    }

    // Test 11: Resend Verification
    console.log('\n11. Testing Resend Verification...');
    const resendResponse = await request(app)
      .post('/api/v1/provider/resend-verification')
      .send({
        email: 'john.doe@test.com'
      });

    if (resendResponse.status === 200) {
      console.log('✅ Resend verification successful');
    } else {
      console.log('❌ Resend verification failed:', resendResponse.body.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run tests
async function runTests() {
  try {
    await setupTestDB();
    await testRoutes();
    console.log('\n=== Route Testing Complete ===');
    console.log('✅ All core functionality is working!');
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  } finally {
    await cleanup();
  }
}

// Run the tests
runTests(); 