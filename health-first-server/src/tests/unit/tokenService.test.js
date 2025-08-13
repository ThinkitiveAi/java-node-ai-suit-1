const { generateAccessToken, generateRefreshToken, verifyToken, decodeToken } = require('../../utils/jwtUtils');

describe('jwtUtils', () => {
  const payload = { providerId: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'provider' };

  it('should generate and verify access token', () => {
    const token = generateAccessToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.providerId).toBe(payload.providerId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.type).toBe('access');
  });

  it('should generate and verify refresh token', () => {
    const token = generateRefreshToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.providerId).toBe(payload.providerId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.type).toBe('refresh');
  });

  it('should decode token without verifying', () => {
    const token = generateAccessToken(payload);
    const decoded = decodeToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.email).toBe(payload.email);
  });
});
