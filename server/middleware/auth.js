const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log("Authenticating token..."); // Log for debugging
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log("Token received:", token); // Log the token for debugging

  if (!token) return res.status(401).json({ error: 'Access token missing' });


  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err); // Log verification errors
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
