export function success(res, message, data = null) {
  res.json({ success: true, message, data });
}

export function fail(res, message, status = 400) {
  res.status(status).json({ success: false, message });
}
