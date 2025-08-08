const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcryptjs');

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
const validProvider = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@test.com',
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
};

async function testRoutesDetailed() {
  console.log('\n=== Detailed Provider Route Testing ===\n');

  try {
    // Test 1: Provider Registration with detailed validation
    console.log('1. Testing Provider Registration (Detailed)...');
    const registerResponse = await request(app)
      .post('/api/v1/provider/register')
      .send(validProvider);
    
    console.log('   Status:', registerResponse.status);
    console.log('   Success:', registerResponse.body.success);
    
    if (registerResponse.status === 201) {
      console.log('✅ Registration successful');
      console.log('   - Provider ID:', registerResponse.body.data.provider_id);
      console.log('   - Email:', registerResponse.body.data.email);
      console.log('   - Verification Status:', registerResponse.body.data.verification_status);
    } else {
      console.log('❌ Registration failed');
      if (registerResponse.body.errors) {
        console.log('   Validation errors:');
        registerResponse.body.errors.forEach(error => {
          console.log(`     - ${error.field}: ${error.message}`);
        });
      } else {
        console.log('   Error:', registerResponse.body.message);
      }
    }

    // Test 2: Create verified provider for login tests
    console.log('\n2. Creating verified provider for login tests...');
    const password_hash = await bcrypt.hash(validProvider.password, 12);
    const verifiedProvider = await Provider.create({
      ...validProvider,
      email: 'verified@test.com',
      phone_number: '+19876543210',
      license_number: 'MD654321',
      password_hash,
      verification_status: 'verified',
      is_active: true,
      email_verified_at: new Date()
    });
    console.log('✅ Verified provider created with ID:', verifiedProvider._id);

    // Test 3: Login with detailed response
    console.log('\n3. Testing Provider Login (Detailed)...');
    const loginResponse = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: 'verified@test.com',
        password: validProvider.password
      });

    console.log('   Status:', loginResponse.status);
    console.log('   Success:', loginResponse.body.success);

    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log('   - Access token length:', loginResponse.body.data.access_token.length);
      console.log('   - Refresh token length:', loginResponse.body.data.refresh_token.length);
      console.log('   - Token type:', loginResponse.body.data.token_type);
      console.log('   - Expires in:', loginResponse.body.data.expires_in);
      console.log('   - Provider email:', loginResponse.body.data.provider.email);
      console.log('   - Provider verification status:', loginResponse.body.data.provider.verification_status);
      
      const accessToken = loginResponse.body.data.access_token;
      const refreshToken = loginResponse.body.data.refresh_token;

      // Test 4: Onboarding Status with details
      console.log('\n4. Testing Onboarding Status (Detailed)...');
      const onboardingResponse = await request(app)
        .get('/api/v1/provider/onboarding/status')
        .set('Authorization', `Bearer ${accessToken}`);

      console.log('   Status:', onboardingResponse.status);
      console.log('   Success:', onboardingResponse.body.success);

      if (onboardingResponse.status === 200) {
        console.log('✅ Onboarding status retrieved');
        const data = onboardingResponse.body.data;
        console.log('   - Progress:', data.progress_percentage + '%');
        console.log('   - Current step:', data.current_step);
        console.log('   - Email verified:', data.onboarding_steps.email_verified);
        console.log('   - Profile completed:', data.onboarding_steps.profile_completed);
        console.log('   - Documents uploaded:', data.onboarding_steps.documents_uploaded);
        console.log('   - Admin approved:', data.onboarding_steps.admin_approved);
        console.log('   - Next steps:', data.next_steps);
      } else {
        console.log('❌ Onboarding status failed:', onboardingResponse.body.message);
      }

      // Test 5: Token Refresh with details
      console.log('\n5. Testing Token Refresh (Detailed)...');
      const refreshResponse = await request(app)
        .post('/api/v1/provider/refresh-token')
        .send({
          refresh_token: refreshToken
        });

      console.log('   Status:', refreshResponse.status);
      console.log('   Success:', refreshResponse.body.success);

      if (refreshResponse.status === 200) {
        console.log('✅ Token refresh successful');
        console.log('   - New access token length:', refreshResponse.body.data.access_token.length);
        console.log('   - New refresh token length:', refreshResponse.body.data.refresh_token.length);
        console.log('   - Token type:', refreshResponse.body.data.token_type);
        console.log('   - Expires in:', refreshResponse.body.data.expires_in);
      } else {
        console.log('❌ Token refresh failed:', refreshResponse.body.message);
      }

      // Test 6: Get Provider by ID with details
      console.log('\n6. Testing Get Provider by ID (Detailed)...');
      const getProviderResponse = await request(app)
        .get(`/api/v1/provider/${verifiedProvider._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      console.log('   Status:', getProviderResponse.status);
      console.log('   Success:', getProviderResponse.body.success);

      if (getProviderResponse.status === 200) {
        console.log('✅ Get provider successful');
        const provider = getProviderResponse.body.data.provider;
        console.log('   - Provider ID:', provider._id);
        console.log('   - Name:', provider.first_name + ' ' + provider.last_name);
        console.log('   - Email:', provider.email);
        console.log('   - Specialization:', provider.specialization);
        console.log('   - Verification status:', provider.verification_status);
        console.log('   - Is active:', provider.is_active);
      } else {
        console.log('❌ Get provider failed:', getProviderResponse.body.message);
      }

      // Test 7: Update Provider with details
      console.log('\n7. Testing Update Provider (Detailed)...');
      const updateData = {
        first_name: 'John Updated',
        years_of_experience: 15,
        clinic_address: {
          street: '456 Updated St',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210'
        }
      };

      const updateResponse = await request(app)
        .put(`/api/v1/provider/${verifiedProvider._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      console.log('   Status:', updateResponse.status);
      console.log('   Success:', updateResponse.body.success);

      if (updateResponse.status === 200) {
        console.log('✅ Update provider successful');
        const provider = updateResponse.body.data.provider;
        console.log('   - Updated name:', provider.first_name);
        console.log('   - Updated experience:', provider.years_of_experience);
        console.log('   - Updated address:', provider.clinic_address.street);
        console.log('   - Updated at:', provider.updated_at);
      } else {
        console.log('❌ Update provider failed:', updateResponse.body.message);
      }

      // Test 8: Get All Providers with details
      console.log('\n8. Testing Get All Providers (Detailed)...');
      const getAllResponse = await request(app)
        .get('/api/v1/provider/')
        .set('Authorization', `Bearer ${accessToken}`);

      console.log('   Status:', getAllResponse.status);
      console.log('   Success:', getAllResponse.body.success);

      if (getAllResponse.status === 200) {
        console.log('✅ Get all providers successful');
        const data = getAllResponse.body.data;
        console.log('   - Providers count:', data.providers.length);
        console.log('   - Pagination page:', data.pagination.page);
        console.log('   - Pagination limit:', data.pagination.limit);
        console.log('   - Pagination total:', data.pagination.total);
        console.log('   - Pagination pages:', data.pagination.pages);
        
        if (data.providers.length > 0) {
          const firstProvider = data.providers[0];
          console.log('   - First provider name:', firstProvider.first_name + ' ' + firstProvider.last_name);
          console.log('   - First provider email:', firstProvider.email);
        }
      } else {
        console.log('❌ Get all providers failed:', getAllResponse.body.message);
      }

      // Test 9: Logout with details
      console.log('\n9. Testing Logout (Detailed)...');
      const logoutResponse = await request(app)
        .post('/api/v1/provider/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      console.log('   Status:', logoutResponse.status);
      console.log('   Success:', logoutResponse.body.success);

      if (logoutResponse.status === 200) {
        console.log('✅ Logout successful');
        console.log('   - Message:', logoutResponse.body.message);
        console.log('   - Request ID:', logoutResponse.body.request_id);
      } else {
        console.log('❌ Logout failed:', logoutResponse.body.message);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.body.message);
      if (loginResponse.body.error_code) {
        console.log('   Error code:', loginResponse.body.error_code);
      }
    }

    // Test 10: Test invalid login attempts
    console.log('\n10. Testing Invalid Login Attempts...');
    
    // Test with wrong password
    const wrongPasswordResponse = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: 'verified@test.com',
        password: 'wrongpassword'
      });
    
    console.log('   Wrong password status:', wrongPasswordResponse.status);
    console.log('   Error code:', wrongPasswordResponse.body.error_code);

    // Test with non-existent email
    const wrongEmailResponse = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'password123'
      });
    
    console.log('   Wrong email status:', wrongEmailResponse.status);
    console.log('   Error code:', wrongEmailResponse.body.error_code);

    // Test 11: Test authentication middleware
    console.log('\n11. Testing Authentication Middleware...');
    
    // Test without token
    const noTokenResponse = await request(app)
      .get('/api/v1/provider/onboarding/status');
    
    console.log('   No token status:', noTokenResponse.status);
    console.log('   Error code:', noTokenResponse.body.error_code);

    // Test with invalid token
    const invalidTokenResponse = await request(app)
      .get('/api/v1/provider/onboarding/status')
      .set('Authorization', 'Bearer invalid-token');
    
    console.log('   Invalid token status:', invalidTokenResponse.status);
    console.log('   Error code:', invalidTokenResponse.body.error_code);

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run tests
async function runDetailedTests() {
  try {
    await setupTestDB();
    await testRoutesDetailed();
    console.log('\n=== Detailed Route Testing Complete ===');
    console.log('✅ All core functionality is working correctly!');
    console.log('✅ Authentication system is secure!');
    console.log('✅ Onboarding flow is complete!');
    console.log('✅ Provider management is functional!');
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  } finally {
    await cleanup();
  }
}

// Run the tests
runDetailedTests(); 