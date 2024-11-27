const crypto = require('crypto');

const secretKey = "GV43#&544fgh@#6h86y43t6345$";
const algorithm = 'aes-256-cbc'; 
const iv = crypto.randomBytes(16);

function encryptData(data) {
  const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(secretKey, 'salt', 32), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
}

module.exports = { encryptData };
