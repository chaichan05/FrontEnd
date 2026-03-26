// Global error handler — ต้องลงทะเบียนเป็น middleware ตัวสุดท้ายใน app.js
const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler]', err);
  res.status(err.status || 500).json({
    success:   false,
    message:   err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
