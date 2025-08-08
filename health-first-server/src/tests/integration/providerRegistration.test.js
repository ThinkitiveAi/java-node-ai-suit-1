const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const nodemailer = require('nodemailer');
const app = require('../../app'); // You need to create an Express app entry point that uses your routes
const Provider = require('../../models/Provider');

jest.mock('nodemailer');
const sendMailMock = jest.fn().mockResolvedValue(true);
nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

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
  sendMailMock.mockClear();
});

describe('Provider Registration API', () => {
  const validProvider = {
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
  };

  it('POST /api/v1/provider/register - success case', async () => {
    const res = await request(app)
      .post('/api/v1/provider/register')
      .send(validProvider);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(validProvider.email);
    expect(sendMailMock).toHaveBeenCalled();
  });

  it('POST /api/v1/provider/register - validation errors', async () => {
    const res = await request(app)
      .post('/api/v1/provider/register')
      .send({ ...validProvider, email: 'bad-email', password: '123', confirm_password: '123' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/v1/provider/register - duplicate email', async () => {
    await Provider.create({ ...validProvider, password_hash: 'hash', email: validProvider.email });
    const res = await request(app)
      .post('/api/v1/provider/register')
      .send(validProvider);
    expect(res.status).toBe(409);
    expect(res.body.error_code).toBe('DUPLICATE_EMAIL');
  });

  it('POST /api/v1/provider/register - duplicate phone', async () => {
    await Provider.create({ ...validProvider, password_hash: 'hash', phone_number: validProvider.phone_number, email: 'other@email.com', license_number: 'MD654321' });
    const res = await request(app)
      .post('/api/v1/provider/register')
      .send(validProvider);
    expect(res.status).toBe(409);
    expect(res.body.error_code).toBe('DUPLICATE_PHONE');
  });

  it('POST /api/v1/provider/register - duplicate license', async () => {
    await Provider.create({ ...validProvider, password_hash: 'hash', license_number: validProvider.license_number, email: 'other@email.com', phone_number: '+19876543210' });
    const res = await request(app)
      .post('/api/v1/provider/register')
      .send(validProvider);
    expect(res.status).toBe(409);
    expect(res.body.error_code).toBe('DUPLICATE_LICENSE');
  });

  it('POST /api/v1/provider/register - weak password', async () => {
    const res = await request(app)
      .post('/api/v1/provider/register')
      .send({ ...validProvider, password: 'password', confirm_password: 'password' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/provider/register - password with name/email', async () => {
    const res = await request(app)
      .post('/api/v1/provider/register')
      .send({ ...validProvider, password: 'JohnDoe123!', confirm_password: 'JohnDoe123!' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/provider/register - rate limiting (per-IP)', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/v1/provider/register').send({ ...validProvider, email: `john${i}@doe.com`, phone_number: `+1234567890${i}`, license_number: `MD12345${i}` });
    }
    const res = await request(app).post('/api/v1/provider/register').send({ ...validProvider, email: 'john6@doe.com', phone_number: '+12345678906', license_number: 'MD1234566' });
    expect(res.status).toBe(429);
  });

  // Add more tests for per-email and global rate limiting as needed
}); 