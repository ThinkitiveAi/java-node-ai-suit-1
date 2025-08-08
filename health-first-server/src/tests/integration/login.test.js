const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const app = require('../../app');
const Provider = require('../../models/Provider');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Provider.deleteMany({});
});

describe('Provider Login API', () => {
  const validProvider = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
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

  beforeEach(async () => {
    // Create a verified provider for login tests
    const password_hash = await bcrypt.hash(validProvider.password, 12);
    await Provider.create({
      ...validProvider,
      password_hash,
      verification_status: 'verified',
      is_active: true,
      email_verified_at: new Date()
    });
  });

  it('POST /api/v1/provider/login - success case', async () => {
    const res = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: validProvider.email,
        password: validProvider.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.access_token).toBeDefined();
    expect(res.body.data.refresh_token).toBeDefined();
    expect(res.body.data.provider.email).toBe(validProvider.email);
  });

  it('POST /api/v1/provider/login - invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: validProvider.email,
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error_code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/v1/provider/login - unverified account', async () => {
    // Create unverified provider
    const password_hash = await bcrypt.hash(validProvider.password, 12);
    await Provider.create({
      ...validProvider,
      password_hash,
      verification_status: 'pending',
      is_active: true,
      email: 'unverified@example.com'
    });

    const res = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: 'unverified@example.com',
        password: validProvider.password
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error_code).toBe('ACCOUNT_NOT_VERIFIED');
  });

  it('POST /api/v1/provider/login - suspended account', async () => {
    // Create suspended provider
    const password_hash = await bcrypt.hash(validProvider.password, 12);
    await Provider.create({
      ...validProvider,
      password_hash,
      verification_status: 'verified',
      is_active: false,
      email: 'suspended@example.com'
    });

    const res = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: 'suspended@example.com',
        password: validProvider.password
      });

    expect(res.status).toBe(423);
    expect(res.body.success).toBe(false);
    expect(res.body.error_code).toBe('ACCOUNT_SUSPENDED');
  });

  it('POST /api/v1/provider/login - validation errors', async () => {
    const res = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: 'invalid-email',
        password: ''
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/v1/provider/refresh-token - success case', async () => {
    // First login to get tokens
    const loginRes = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: validProvider.email,
        password: validProvider.password
      });

    const refreshToken = loginRes.body.data.refresh_token;

    // Use refresh token
    const res = await request(app)
      .post('/api/v1/provider/refresh-token')
      .send({
        refresh_token: refreshToken
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.access_token).toBeDefined();
    expect(res.body.data.refresh_token).toBeDefined();
  });

  it('POST /api/v1/provider/refresh-token - invalid token', async () => {
    const res = await request(app)
      .post('/api/v1/provider/refresh-token')
      .send({
        refresh_token: 'invalid-token'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error_code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('POST /api/v1/provider/logout - success case', async () => {
    // First login to get tokens
    const loginRes = await request(app)
      .post('/api/v1/provider/login')
      .send({
        email: validProvider.email,
        password: validProvider.password
      });

    const accessToken = loginRes.body.data.access_token;

    // Logout
    const res = await request(app)
      .post('/api/v1/provider/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
