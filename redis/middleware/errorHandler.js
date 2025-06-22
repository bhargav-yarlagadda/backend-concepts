export function errorHandler(error, req, res, next) {
  if (error) {
    console.error(error); // log full error object
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }

  next(); // only called if no error
}
