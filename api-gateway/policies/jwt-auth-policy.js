// api-gateway/policies/jwt-auth-policy.js
const jwt = require('jsonwebtoken');

module.exports = {
  name: 'jwt-auth',
  policy: (actionParams) => {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized: No token provided');
      }

      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET;

      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send('Unauthorized: Invalid token');
        }

        // Attach the decoded user info to the request for downstream services
        req.user = decoded;
        next();
      });
    };
  }
};
