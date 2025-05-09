const NodeCache = require('node-cache');

// Cache configuration
const cacheConfig = {
  stdTTL: 600, // 10 minutes
  checkperiod: 120, // 2 minutes
  useClones: false,
  maxKeys: 1000
};

// Create cache instances for different purposes
const cookieSpotsCache = new NodeCache({
  ...cacheConfig,
  stdTTL: 300 // 5 minutes for cookie spots
});

const cookieTypesCache = new NodeCache({
  ...cacheConfig,
  stdTTL: 3600 // 1 hour for cookie types
});

const dietaryOptionsCache = new NodeCache({
  ...cacheConfig,
  stdTTL: 3600 // 1 hour for dietary options
});

// Cache middleware
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cookieSpotsCache.get(key);

    if (cachedResponse) {
      res.send(cachedResponse);
      return;
    }

    res.sendResponse = res.send;
    res.send = (body) => {
      cookieSpotsCache.set(key, body, duration);
      res.sendResponse(body);
    };
    next();
  };
};

// Cache invalidation middleware
const invalidateCache = (pattern) => {
  return (req, res, next) => {
    const keys = cookieSpotsCache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    cookieSpotsCache.del(matchingKeys);
    next();
  };
};

module.exports = {
  cookieSpotsCache,
  cookieTypesCache,
  dietaryOptionsCache,
  cacheMiddleware,
  invalidateCache
}; 