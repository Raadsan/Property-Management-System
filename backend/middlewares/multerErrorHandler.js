const multerErrorHandler = (err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err);
  
  // Handle specific Multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: "File upload error",
      error: err.message,
      code: err.code
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: typeof err === 'object' ? err : String(err),
    details: err.stack ? "Check server logs for stack trace" : undefined
  });
};

export default multerErrorHandler;
