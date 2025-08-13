const { hashPassword, generateVerificationToken } = require('../../services/authService');

describe('authService', () => {
  it('hashPassword should produce a bcrypt hash different from input', async () => {
    const password = 'StrongPassw0rd!';
    const hash = await hashPassword(password);
    expect(hash).toBeDefined();
    expect(hash).not.toEqual(password);
    expect(hash).toMatch(/\$2[aby]\$\d{2}\$.{53}/);
  });

  it('generateVerificationToken should return a uuid-like string', async () => {
    const token = await generateVerificationToken();
    expect(token).toBeDefined();
    expect(token).toMatch(/^[0-9a-fA-F-]{36}$/);
  });
});
