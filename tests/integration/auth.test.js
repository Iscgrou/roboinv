// tests/integration/auth.test.js
const axios = require('axios');

const API_GATEWAY_URL = 'http://localhost:9000'; // Assuming the gateway runs on this port
const AUTH_SERVICE_URL = 'http://localhost:3010'; // Assuming the auth service is exposed on this port for login

describe('API Gateway Authentication Flow', () => {
  // NOTE: This test requires the entire application to be running via `docker-compose up`
  // It also requires a pre-existing admin user in the database with a known password.
  // For a real CI/CD pipeline, you'd have a script to set up this test data.

  let authToken;

  it('should fail to access a protected route without a token', async () => {
    try {
      await axios.get(`${API_GATEWAY_URL}/representatives`);
    } catch (error) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toContain('Unauthorized');
    }
  });

  it('should successfully log in and receive a JWT', async () => {
    // This assumes an admin user 'testadmin' with password 'password123' exists in the DB.
    // The password hash would have been created using the /hash-password endpoint.
    const response = await axios.post(`${AUTH_SERVICE_URL}/login`, {
      username: 'testadmin',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
    authToken = response.data.token;
  });

  it('should fail to access a protected route with an invalid token', async () => {
    try {
        await axios.get(`${API_GATEWAY_URL}/representatives`, {
            headers: { 'Authorization': 'Bearer invalidtoken123' }
        });
    } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toContain('Invalid token');
    }
  });

  it('should successfully access a protected route with a valid token', async () => {
    const response = await axios.get(`${API_GATEWAY_URL}/representatives`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    expect(response.status).toBe(200);
    // We expect an array (even if empty) for the list of representatives
    expect(Array.isArray(response.data)).toBe(true);
  });
});
