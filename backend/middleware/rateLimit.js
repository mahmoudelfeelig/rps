const buckets = new Map();

function rateLimit({ windowMs = 60_000, max = 30, keyPrefix = 'global' } = {}) {
  return (req, res, next) => {
    const ip = req.headers['cf-connecting-ip'] || req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      return res.status(429).json({ message: 'Too many requests. Try again later.' });
    }

    return next();
  };
}

module.exports = rateLimit;
