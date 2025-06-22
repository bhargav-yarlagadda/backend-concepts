/**
 * Redis Key Management Utilities
 * 
 * This module provides structured key generation for Redis operations.
 * Using a consistent naming convention: project:entity:identifier
 * 
 * Benefits of structured keys:
 * - Easy to identify and manage different data types
 * - Supports Redis SCAN operations for pattern matching
 * - Prevents key collisions across different entities
 * - Enables efficient key expiration and deletion strategies
 */

/**
 * Generates a structured Redis key with project prefix
 * @param {...string} args - Key components to join
 * @returns {string} Structured Redis key
 * 
 * Example: getKey("restaurants", "123") returns "project:restaurants:123"
 */
export function getKey(...args) {
    return `project:${args.join(":")}` // we are making our key more structured like project_name:ItemName:key
}

/**
 * Generates a Redis key for a specific restaurant by ID
 * @param {string} id - Restaurant unique identifier
 * @returns {string} Redis key for the restaurant hash
 * 
 * Example: restrauntKeyById("abc123") returns "project:restraunts:abc123"
 */
export const restrauntKeyById = (id) => {
    return getKey("restraunts", id)
}

/**
 * Generates a Redis key for a specific cuisine by ID
 * @param {string} id - Cuisine unique identifier
 * @returns {string} Redis key for the cuisine hash
 * 
 * Example: cuisineKeyById("xyz789") returns "project:cuisines:xyz789"
 */
export const cuisineKeyById = (id) => {
    return getKey("cuisines", id)
}

/**
 * Generates a Redis key for storing all cuisine IDs (for listing operations)
 * @returns {string} Redis key for the cuisine index set
 * 
 * This key stores a set of all cuisine IDs for efficient listing
 */
export const cuisineIndexKey = () => {
    return getKey("cuisines", "index")
}

/**
 * Generates a Redis key for storing all restaurant IDs (for listing operations)
 * @returns {string} Redis key for the restaurant index set
 * 
 * This key stores a set of all restaurant IDs for efficient listing
 */
export const restaurantIndexKey = () => {
    return getKey("restraunts", "index")
}