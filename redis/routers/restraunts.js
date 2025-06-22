import { Router } from "express";
import { nanoid } from "nanoid";
import { restrauntKeyById, restaurantIndexKey } from "../utils/keys.js";
import { initialiseRedisClient } from "../utils/client.js";

const router = Router()

/**
 * RESTAURANT ROUTES - Redis Hash Operations
 * 
 * This module demonstrates Redis Hash data structure operations for managing restaurant data.
 * 
 * Redis Hash Benefits for Restaurants:
 * - Efficient storage of complex restaurant information
 * - Atomic operations on individual restaurant properties
 * - Memory efficient for objects with many fields
 * - Built-in field existence checking
 * - Partial updates without reading entire object
 * - Easy to add new fields without schema changes
 * 
 * Key Operations Demonstrated:
 * - HSET: Set multiple fields at once
 * - HGET: Get individual field value
 * - HGETALL: Get all fields and values
 * - HDEL: Delete specific fields
 * - DEL: Delete entire hash
 * - HEXISTS: Check if field exists
 * - HSETNX: Set field only if it doesn't exist
 * - SADD/SMEMBERS: Maintain index of all restaurant IDs
 * - Pipeline: Batch operations for better performance
 */

/**
 * POST /restraunts
 * Create a new restaurant using Redis Hash
 * 
 * Redis Operations:
 * - HSET: Stores restaurant data as hash fields
 * - SADD: Adds restaurant ID to index set for listing
 * 
 * Hash Structure:
 * {
 *   id: "unique_id",
 *   name: "restaurant_name",
 *   location: "address",
 *   cuisine: "cuisine_type",
 *   rating: "average_rating",
 *   priceRange: "budget_level",
 *   phone: "contact_number",
 *   website: "website_url",
 *   hours: "operating_hours",
 *   createdAt: "timestamp"
 * }
 */
router.post('/', async (req, res, next) => {
    const body = req.body
    try {
        const client = await initialiseRedisClient()
        const id = nanoid()
        const restaurantKey = restrauntKeyById(id)

        // Validate required fields
        if (!body.name || !body.location) {
            return res.status(400).json({
                valid: false,
                message: "Name and location are required fields"
            })
        }

        // Prepare restaurant data for hash storage
        const restaurantData = {
            id: id,
            name: body.name,
            location: body.location,
            cuisine: body.cuisine || "",
            rating: body.rating || "0.0",
            priceRange: body.priceRange || "moderate",
            phone: body.phone || "",
            website: body.website || "",
            hours: body.hours || "",
            description: body.description || "",
            createdAt: new Date().toISOString()
        }

        // Use HSET to store multiple fields atomically
        // HSET returns the number of fields that were added
        const addResult = await client.hSet(restaurantKey, restaurantData)

        // Add restaurant ID to index set for efficient listing
        await client.sAdd(restaurantIndexKey(), id)

        console.log(`Restaurant added with ${addResult} fields`)

        return res.status(201).json({
            valid: true,
            message: "Restaurant added successfully",
            data: restaurantData
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /restraunts
 * Get all restaurants using Redis Hash operations
 * 
 * Redis Operations:
 * - SMEMBERS: Get all restaurant IDs from index set
 * - HGETALL: Get all fields for each restaurant hash
 * 
 * Performance Note:
 * This operation uses pipeline for better performance when fetching multiple hashes
 * 
 * Query Parameters:
 * - limit: Maximum number of restaurants to return
 * - offset: Number of restaurants to skip (for pagination)
 */
router.get('/', async (req, res, next) => {
    const { limit, offset } = req.query

    try {
        const client = await initialiseRedisClient()

        // Get all restaurant IDs from the index set
        const restaurantIds = await client.sMembers(restaurantIndexKey())

        if (restaurantIds.length === 0) {
            return res.status(200).json({
                valid: true,
                message: "No restaurants found",
                data: [],
                pagination: {
                    total: 0,
                    limit: parseInt(limit) || restaurantIds.length,
                    offset: parseInt(offset) || 0
                }
            })
        }

        // Apply pagination
        const startIndex = parseInt(offset) || 0
        const endIndex = limit ? startIndex + parseInt(limit) : restaurantIds.length
        const paginatedIds = restaurantIds.slice(startIndex, endIndex)

        // Use pipeline for better performance when fetching multiple hashes
        const pipeline = client.pipeline()

        // Queue HGETALL operations for paginated restaurants
        paginatedIds.forEach(id => {
            const restaurantKey = restrauntKeyById(id)
            pipeline.hGetAll(restaurantKey)
        })

        // Execute all operations in a single round trip
        const results = await pipeline.exec()

        // Extract restaurant data from results
        const restaurants = results.map(([err, data]) => {
            if (err) throw err
            return data
        }).filter(restaurant => Object.keys(restaurant).length > 0) // Filter out empty hashes

        return res.status(200).json({
            valid: true,
            message: `${restaurants.length} restaurants retrieved successfully`,
            data: restaurants,
            pagination: {
                total: restaurantIds.length,
                limit: parseInt(limit) || restaurantIds.length,
                offset: startIndex,
                hasMore: endIndex < restaurantIds.length
            }
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /restraunts/:id
 * Get a specific restaurant by ID using Redis Hash
 * 
 * Redis Operations:
 * - HGETALL: Get all fields of the restaurant hash
 * - HEXISTS: Check if restaurant exists before fetching
 */
router.get('/:id', async (req, res, next) => {
    const { id } = req.params

    try {
        const client = await initialiseRedisClient()
        const restaurantKey = restrauntKeyById(id)

        // Check if restaurant exists using HEXISTS
        const exists = await client.hExists(restaurantKey, 'id')

        if (!exists) {
            return res.status(404).json({
                valid: false,
                message: "Restaurant not found"
            })
        }

        // Get all fields of the restaurant hash
        const restaurant = await client.hGetAll(restaurantKey)

        return res.status(200).json({
            valid: true,
            message: "Restaurant retrieved successfully",
            data: restaurant
        })
    } catch (error) {
        next(error)
    }
})

/**
 * PUT /restraunts/:id
 * Update a restaurant using Redis Hash operations
 * 
 * Redis Operations:
 * - HEXISTS: Check if restaurant exists
 * - HSET: Update specific fields (only provided fields are updated)
 * - HGETALL: Return updated restaurant data
 * 
 * Hash Update Benefits:
 * - Only specified fields are updated (partial updates)
 * - No need to read entire object first
 * - Atomic field updates
 * - Preserves existing fields not included in update
 */
router.put('/:id', async (req, res, next) => {
    const { id } = req.params
    const body = req.body

    try {
        const client = await initialiseRedisClient()
        const restaurantKey = restrauntKeyById(id)

        // Check if restaurant exists
        const exists = await client.hExists(restaurantKey, 'id')

        if (!exists) {
            return res.status(404).json({
                valid: false,
                message: "Restaurant not found"
            })
        }

        // Prepare update data (exclude id and createdAt from updates)
        const updateData = {}
        if (body.name) updateData.name = body.name
        if (body.location) updateData.location = body.location
        if (body.cuisine !== undefined) updateData.cuisine = body.cuisine
        if (body.rating !== undefined) updateData.rating = body.rating
        if (body.priceRange) updateData.priceRange = body.priceRange
        if (body.phone !== undefined) updateData.phone = body.phone
        if (body.website !== undefined) updateData.website = body.website
        if (body.hours !== undefined) updateData.hours = body.hours
        if (body.description !== undefined) updateData.description = body.description

        updateData.updatedAt = new Date().toISOString()

        // Update only the provided fields using HSET
        const updateResult = await client.hSet(restaurantKey, updateData)

        // Get updated restaurant data
        const updatedRestaurant = await client.hGetAll(restaurantKey)

        return res.status(200).json({
            valid: true,
            message: "Restaurant updated successfully",
            data: updatedRestaurant
        })
    } catch (error) {
        next(error)
    }
})

/**
 * PATCH /restraunts/:id
 * Partially update specific fields of a restaurant
 * 
 * Redis Operations:
 * - HSET: Update only specified fields
 * - HSETNX: Set field only if it doesn't exist (for specific use cases)
 * 
 * Difference from PUT:
 * - PATCH is for partial updates
 * - PUT is for complete replacement (though we implement it as partial here)
 */
router.patch('/:id', async (req, res, next) => {
    const { id } = req.params
    const body = req.body

    try {
        const client = await initialiseRedisClient()
        const restaurantKey = restrauntKeyById(id)

        // Check if restaurant exists
        const exists = await client.hExists(restaurantKey, 'id')

        if (!exists) {
            return res.status(404).json({
                valid: false,
                message: "Restaurant not found"
            })
        }

        // Update only provided fields
        const updateData = { ...body }
        updateData.updatedAt = new Date().toISOString()

        // Use HSET for partial updates
        await client.hSet(restaurantKey, updateData)

        // Get updated restaurant
        const updatedRestaurant = await client.hGetAll(restaurantKey)

        return res.status(200).json({
            valid: true,
            message: "Restaurant partially updated successfully",
            data: updatedRestaurant
        })
    } catch (error) {
        next(error)
    }
})

/**
 * DELETE /restraunts/:id
 * Delete a restaurant using Redis operations
 * 
 * Redis Operations:
 * - DEL: Delete the entire restaurant hash
 * - SREM: Remove restaurant ID from index set
 * - HEXISTS: Check if restaurant exists before deletion
 */
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params

    try {
        const client = await initialiseRedisClient()
        const restaurantKey = restrauntKeyById(id)

        // Check if restaurant exists
        const exists = await client.hExists(restaurantKey, 'id')

        if (!exists) {
            return res.status(404).json({
                valid: false,
                message: "Restaurant not found"
            })
        }

        // Delete the restaurant hash
        await client.del(restaurantKey)

        // Remove from index set
        await client.sRem(restaurantIndexKey(), id)

        return res.status(200).json({
            valid: true,
            message: "Restaurant deleted successfully"
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /restraunts/:id/field/:fieldName
 * Get a specific field from a restaurant hash
 * 
 * Redis Operations:
 * - HGET: Get specific field value
 * - HEXISTS: Check if field exists
 * 
 * Use Cases:
 * - Efficient when you only need one field
 * - Reduces network transfer
 * - Useful for checking specific properties
 * - Good for lightweight API calls
 */
router.get('/:id/field/:fieldName', async (req, res, next) => {
    const { id, fieldName } = req.params

    try {
        const client = await initialiseRedisClient()
        const restaurantKey = restrauntKeyById(id)

        // Check if restaurant exists
        const restaurantExists = await client.hExists(restaurantKey, 'id')

        if (!restaurantExists) {
            return res.status(404).json({
                valid: false,
                message: "Restaurant not found"
            })
        }

        // Check if field exists
        const fieldExists = await client.hExists(restaurantKey, fieldName)

        if (!fieldExists) {
            return res.status(404).json({
                valid: false,
                message: `Field '${fieldName}' not found in restaurant`
            })
        }

        // Get specific field value
        const fieldValue = await client.hGet(restaurantKey, fieldName)

        return res.status(200).json({
            valid: true,
            message: `Field '${fieldName}' retrieved successfully`,
            data: {
                field: fieldName,
                value: fieldValue
            }
        })
    } catch (error) {
        next(error)
    }
})

/**
 * DELETE /restraunts/:id/field/:fieldName
 * Delete a specific field from a restaurant hash
 * 
 * Redis Operations:
 * - HDEL: Delete specific field from hash
 * - HEXISTS: Check if field exists before deletion
 * 
 * Note: This doesn't delete the entire restaurant, just removes one field
 */
router.delete('/:id/field/:fieldName', async (req, res, next) => {
    const { id, fieldName } = req.params

    try {
        const client = await initialiseRedisClient()
        const restaurantKey = restrauntKeyById(id)

        // Check if restaurant exists
        const restaurantExists = await client.hExists(restaurantKey, 'id')

        if (!restaurantExists) {
            return res.status(404).json({
                valid: false,
                message: "Restaurant not found"
            })
        }

        // Check if field exists
        const fieldExists = await client.hExists(restaurantKey, fieldName)

        if (!fieldExists) {
            return res.status(404).json({
                valid: false,
                message: `Field '${fieldName}' not found in restaurant`
            })
        }

        // Prevent deletion of critical fields
        const criticalFields = ['id', 'name', 'location']
        if (criticalFields.includes(fieldName)) {
            return res.status(400).json({
                valid: false,
                message: `Cannot delete critical field '${fieldName}'`
            })
        }

        // Delete specific field
        const deleteResult = await client.hDel(restaurantKey, fieldName)

        return res.status(200).json({
            valid: true,
            message: `Field '${fieldName}' deleted successfully`,
            data: {
                deletedField: fieldName,
                fieldsDeleted: deleteResult
            }
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /restraunts/search/by-cuisine/:cuisine
 * Search restaurants by cuisine type
 * 
 * Redis Operations:
 * - SMEMBERS: Get all restaurant IDs
 * - HGET: Get cuisine field for each restaurant
 * - Pipeline: Batch operations for performance
 * 
 * Performance Note:
 * This is a simple search implementation. For production, consider using
 * Redis Search module or maintaining separate indexes for better performance.
 */
router.get('/search/by-cuisine/:cuisine', async (req, res, next) => {
    const { cuisine } = req.params

    try {
        const client = await initialiseRedisClient()

        // Get all restaurant IDs
        const restaurantIds = await client.sMembers(restaurantIndexKey())

        if (restaurantIds.length === 0) {
            return res.status(200).json({
                valid: true,
                message: "No restaurants found",
                data: []
            })
        }

        // Use pipeline to get cuisine field for all restaurants
        const pipeline = client.pipeline()

        restaurantIds.forEach(id => {
            const restaurantKey = restrauntKeyById(id)
            pipeline.hGet(restaurantKey, 'cuisine')
        })

        const results = await pipeline.exec()

        // Filter restaurants by cuisine
        const matchingRestaurants = []

        for (let i = 0; i < restaurantIds.length; i++) {
            const [err, cuisineValue] = results[i]
            if (err) throw err

            if (cuisineValue && cuisineValue.toLowerCase().includes(cuisine.toLowerCase())) {
                const restaurantKey = restrauntKeyById(restaurantIds[i])
                const restaurant = await client.hGetAll(restaurantKey)
                matchingRestaurants.push(restaurant)
            }
        }

        return res.status(200).json({
            valid: true,
            message: `${matchingRestaurants.length} restaurants found with cuisine '${cuisine}'`,
            data: matchingRestaurants
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /restraunts/stats/count
 * Get total count of restaurants
 * 
 * Redis Operations:
 * - SCARD: Get cardinality (count) of restaurant index set
 * 
 * Use Cases:
 * - Dashboard statistics
 * - Pagination metadata
 * - System monitoring
 */
router.get('/stats/count', async (req, res, next) => {
    try {
        const client = await initialiseRedisClient()

        const count = await client.sCard(restaurantIndexKey())

        return res.status(200).json({
            valid: true,
            message: "Restaurant count retrieved successfully",
            data: {
                totalRestaurants: count
            }
        })
    } catch (error) {
        next(error)
    }
})

export default router