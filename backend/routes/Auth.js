const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} = require("../controllers/Authcontroller");

const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resendVerificationLimiter,
} = require("../middleware/rateLimiter");


router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/logout", logout); // logout pe nahi lagana (safe hai)
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword); // reset pe nahi (ek baar ka token hai)
router.get("/verify-email/:token", verifyEmail); // verify pe nahi (ek baar ka token hai)
router.post("/resend-verification", resendVerificationLimiter, resendVerification);

module.exports = router;