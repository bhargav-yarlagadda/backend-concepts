import { Router } from "express";
import { nanoid } from "nanoid";
import { cuisineKeyById, cuisineIndexKey } from "../utils/keys.js";
import { initialiseRedisClient } from "../utils/client.js";

const router = Router()

/**
 * CUISINE ROUTES - Redis Hash Operations
 * 
 * This module demonstrates Redis Hash data structure operations for managing cuisine data.
 * 
 * Redis Hash Benefits for Cuisines:
 * - Efficient storage of object-like data (cuisine properties)
 * - Atomic operations on individual fields
 * - Memory efficient for objects with many fields
 * - Built-in field existence checking
 * - Partial updates without reading entire object
 * 
 * Key Operations Demonstrated:
 * - HSET: Set multiple fields at once
 * - HGET: Get individual field value
 * - HGETALL: Get all fields and values
 * - HDEL: Delete specific fields
 * - DEL: Delete entire hash
 * - HEXISTS: Check if field exists
 * - HSETNX: Set field only if it doesn't exist
 * - SADD/SMEMBERS: Maintain index of all cuisine IDs
 */

/**
 * POST /cuisines
 * Create a new cuisine using Redis Hash
 * 
 * Redis Operations:
 * - HSET: Stores cuisine data as hash fields
 * - SADD: Adds cuisine ID to index set for listing
 * 
 * Hash Structure:
 * {
 *   id: "unique_id",
 *   name: "cuisine_name", 
 *   origin: "country/region",
 *   description: "cuisine_description",
 *   spiceLevel: "mild/medium/hot",
 *   createdAt: "timestamp"
 * }
 */
router.post('/', async (req, res, next) => {
    const body = req.body
    try {
        const client = await initialiseRedisClient()
        const id = nanoid()
        const cuisineKey = cuisineKeyById(id)

        // Validate required fields
        if (!body.name || !body.origin) {
            return res.status(400).json({
                valid: false,
                message: "Name and origin are required fields"
            })
        }

        // Prepare cuisine data for hash storage
        const cuisineData = {
            id: id,
            name: body.name,
            origin: body.origin,
            description: body.description || "",
            spiceLevel: body.spiceLevel || "medium",
            createdAt: new Date().toISOString()
        }

        // Use HSET to store multiple fields atomically
        // HSET returns the number of fields that were added
        const addResult = await client.hSet(cuisineKey, cuisineData)

        // Add cuisine ID to index set for efficient listing
        await client.sAdd(cuisineIndexKey(), id)

        console.log(`Cuisine added with ${addResult} fields`)

        return res.status(201).json({
            valid: true,
            message: "Cuisine added successfully",
            data: cuisineData
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /cuisines
 * Get all cuisines using Redis Hash operations
 * 
 * Redis Operations:
 * - SMEMBERS: Get all cuisine IDs from index set
 * - HGETALL: Get all fields for each cuisine hash
 * 
 * Performance Note:
 * This operation uses pipeline for better performance when fetching multiple hashes
 */
router.get('/', async (req, res, next) => {
    try {
        const client = await initialiseRedisClient()

        // Get all cuisine IDs from the index set
        const cuisineIds = await client.sMembers(cuisineIndexKey())

        if (cuisineIds.length === 0) {
            return res.status(200).json({
                valid: true,
                message: "No cuisines found",
                data: []
            })
        }

        // Use pipeline for better performance when fetching multiple hashes
        const pipeline = client.pipeline()

        // Queue HGETALL operations for all cuisines
        cuisineIds.forEach(id => {
            const cuisineKey = cuisineKeyById(id)
            pipeline.hGetAll(cuisineKey)
        })

        // Execute all operations in a single round trip
        const results = await pipeline.exec()

        // Extract cuisine data from results
        const cuisines = results.map(([err, data]) => {
            if (err) throw err
            return data
        }).filter(cuisine => Object.keys(cuisine).length > 0) // Filter out empty hashes

        return res.status(200).json({
            valid: true,
            message: `${cuisines.length} cuisines retrieved successfully`,
            data: cuisines
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /cuisines/:id
 * Get a specific cuisine by ID using Redis Hash
 * 
 * Redis Operations:
 * - HGETALL: Get all fields of the cuisine hash
 * - HEXISTS: Check if cuisine exists before fetching
 */
router.get('/:id', async (req, res, next) => {
    const { id } = req.params

    try {
        const client = await initialiseRedisClient()
        const cuisineKey = cuisineKeyById(id)

        // Check if cuisine exists using HEXISTS
        const exists = await client.hExists(cuisineKey, 'id')

        if (!exists) {
            return res.status(404).json({
                valid: false,
                message: "Cuisine not found"
            })
        }

        // Get all fields of the cuisine hash
        const cuisine = await client.hGetAll(cuisineKey)

        return res.status(200).json({
            valid: true,
            message: "Cuisine retrieved successfully",
            data: cuisine
        })
    } catch (error) {
        next(error)
    }
})

/**
 * PUT /cuisines/:id
 * Update a cuisine using Redis Hash operations
 * 
 * Redis Operations:
 * - HEXISTS: Check if cuisine exists
 * - HSET: Update specific fields (only provided fields are updated)
 * - HGETALL: Return updated cuisine data
 * 
 * Hash Update Benefits:
 * - Only specified fields are updated (partial updates)
 * - No need to read entire object first
 * - Atomic field updates
 */
router.put('/:id', async (req, res, next) => {
    const { id } = req.params
    const body = req.body

    try {
        const client = await initialiseRedisClient()
        const cuisineKey = cuisineKeyById(id)

        // Check if cuisine exists
        const exists = await client.hExists(cuisineKey, 'id')

        if (!exists) {
            return res.status(404).json({
                valid: false,
                message: "Cuisine not found"
            })
        }

        // Prepare update data (exclude id and createdAt from updates)
        const updateData = {}
        if (body.name) updateData.name = body.name
        if (body.origin) updateData.origin = body.origin
        if (body.description !== undefined) updateData.description = body.description
        if (body.spiceLevel) updateData.spiceLevel = body.spiceLevel

        updateData.updatedAt = new Date().toISOString()

        // Update only the provided fields using HSET
        const updateResult = await client.hSet(cuisineKey, updateData)

        // Get updated cuisine data
        const updatedCuisine = await client.hGetAll(cuisineKey)

        return res.status(200).json({
            valid: true,
            message: "Cuisine updated successfully",
            data: updatedCuisine
        })
    } catch (error) {
        next(error)
    }
})

/**
 * PATCH /cuisines/:id
 * Partially update specific fields of a cuisine
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
        const cuisineKey = cuisineKeyById(id)

        // Check if cuisine exists
        const exists = await client.hExists(cuisineKey, 'id')

        if (!exists) {
            return res.status(404).json({
                valid: false,
                message: "Cuisine not found"
            })
        }

        // Update only provided fields
        const updateData = { ...body }
        updateData.updatedAt = new Date().toISOString()

        // Use HSET for partial updates
        await client.hSet(cuisineKey, updateData)

        // Get updated cuisine
        const updatedCuisine = await client.hGetAll(cuisineKey)

        return res.status(200).json({
            valid: true,
            message: "Cuisine partially updated successfully",
            data: updatedCuisine
        })
    } catch (error) {
        next(error)
    }
})

/**
 * DELETE /cuisines/:id
 * Delete a cuisine using Redis operations
 * 
 * Redis Operations:
 * - DEL: Delete the entire cuisine hash
 * - SREM: Remove cuisine ID from index set
 * - HEXISTS: Check if cuisine exists before deletion
 */
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params

    try {
        const client = await initialiseRedisClient()
        const cuisineKey = cuisineKeyById(id)

        // Check if cuisine exists
        const exists = await client.hExists(cuisineKey, 'id')

        if (!exists) {
            return res.status(404).json({
                valid: false,
                message: "Cuisine not found"
            })
        }

        // Delete the cuisine hash
        await client.del(cuisineKey)

        // Remove from index set
        await client.sRem(cuisineIndexKey(), id)

        return res.status(200).json({
            valid: true,
            message: "Cuisine deleted successfully"
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /cuisines/:id/field/:fieldName
 * Get a specific field from a cuisine hash
 * 
 * Redis Operations:
 * - HGET: Get specific field value
 * - HEXISTS: Check if field exists
 * 
 * Use Cases:
 * - Efficient when you only need one field
 * - Reduces network transfer
 * - Useful for checking specific properties
 */
router.get('/:id/field/:fieldName', async (req, res, next) => {
    const { id, fieldName } = req.params

    try {
        const client = await initialiseRedisClient()
        const cuisineKey = cuisineKeyById(id)

        // Check if cuisine exists
        const cuisineExists = await client.hExists(cuisineKey, 'id')

        if (!cuisineExists) {
            return res.status(404).json({
                valid: false,
                message: "Cuisine not found"
            })
        }

        // Check if field exists
        const fieldExists = await client.hExists(cuisineKey, fieldName)

        if (!fieldExists) {
            return res.status(404).json({
                valid: false,
                message: `Field '${fieldName}' not found in cuisine`
            })
        }

        // Get specific field value
        const fieldValue = await client.hGet(cuisineKey, fieldName)

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
 * DELETE /cuisines/:id/field/:fieldName
 * Delete a specific field from a cuisine hash
 * 
 * Redis Operations:
 * - HDEL: Delete specific field from hash
 * - HEXISTS: Check if field exists before deletion
 * 
 * Note: This doesn't delete the entire cuisine, just removes one field
 */
router.delete('/:id/field/:fieldName', async (req, res, next) => {
    const { id, fieldName } = req.params

    try {
        const client = await initialiseRedisClient()
        const cuisineKey = cuisineKeyById(id)

        // Check if cuisine exists
        const cuisineExists = await client.hExists(cuisineKey, 'id')

        if (!cuisineExists) {
            return res.status(404).json({
                valid: false,
                message: "Cuisine not found"
            })
        }

        // Check if field exists
        const fieldExists = await client.hExists(cuisineKey, fieldName)

        if (!fieldExists) {
            return res.status(404).json({
                valid: false,
                message: `Field '${fieldName}' not found in cuisine`
            })
        }

        // Prevent deletion of critical fields
        const criticalFields = ['id', 'name', 'origin']
        if (criticalFields.includes(fieldName)) {
            return res.status(400).json({
                valid: false,
                message: `Cannot delete critical field '${fieldName}'`
            })
        }

        // Delete specific field
        const deleteResult = await client.hDel(cuisineKey, fieldName)

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

export default router