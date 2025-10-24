const NodeCache = require('node-cache');
const { isDefined, getCopyFunc } = require('./utils');

const copy = getCopyFunc();

/**
 * Cache service for functions groups per uri
 */
class CacheService {
  constructor(cacheTimeInSecs = 60 * 10, checkIntervalInSecs = 60 * 1) {
    this.cacheTimeInSecs = cacheTimeInSecs;
    this.cache = new NodeCache({
      stdTTL: cacheTimeInSecs,
      checkperiod: checkIntervalInSecs,
      useClones: false
    });
  }

  // Remove all cached data
  removeAll() {
    this.cache.flushAll();
  }

  /**
   * Cache the function groups per uri
   *
   * @param {string} uri
   * @param {string} text
   * @param {array} functionGroups
   */
  setFunctionGroups(uri, text, functionGroups) {
    return new Promise(resolve => {
      // Use a simple hash of the text instead of compressing it
      // This is much faster and sufficient for cache validation
      const textHash = this._hashCode(text);

      const data = {
        textHash: textHash,
        textLength: text.length,
        // @ts-ignore
        functionGroups: copy(functionGroups)
      };
      this.cache.set(uri, data);
      resolve();
    });
  }

  /**
   * Simple hash function for cache validation
   * @param {string} str
   * @returns {number}
   */
  _hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   *
   * @param {string} uri
   */
  getFunctionGroups(uri) {
    const cachedData = this.cache.get(uri);

    if (isDefined(cachedData) && isDefined(cachedData.functionGroups)) {
      // If key exists, refresh TTL
      this.cache.ttl(uri, this.cacheTimeInSecs);
      // @ts-ignore
      return copy(cachedData.functionGroups);
    }

    return [];
  }

  /**
   *
   * @param {string} uri
   */
  deleteFunctionGroups(uri) {
    this.cache.del(uri);
  }

  /**
   * Check if text from uri is the same as the cached text
   * @param {string} uri
   * @param {string} text
   */
  isCachedTextValid(uri, text) {
    return new Promise(resolve => {
      if (!this.cache.has(uri)) {
        resolve(false);
        return;
      }

      const cachedData = this.cache.get(uri);

      if (!isDefined(cachedData)) {
        resolve(false);
        return;
      }

      // Quick checks first: length and hash
      if (cachedData.textLength !== text.length) {
        resolve(false);
        return;
      }

      const textHash = this._hashCode(text);
      if (cachedData.textHash !== textHash) {
        resolve(false);
        return;
      }

      // If both length and hash match, consider it valid
      // This is much faster than decompressing and comparing strings
      resolve(true);
    });
  }
}

module.exports = {
  CacheService
};
