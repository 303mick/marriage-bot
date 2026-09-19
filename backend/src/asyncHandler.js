// Express 4 doesn't forward rejected promises from async handlers to error
// middleware on its own — wrap each route so a thrown/rejected error reaches
// the error handler in index.js instead of hanging the request.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { asyncHandler };
