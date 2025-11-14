import { NextFunction, Request, Response } from "express";
import { RedisHelper } from "../config";
import { IApiResponse, JsonValue } from "../types";

/**
 *  Will check Redis before hitting the DB
 *  The reason we are using the factory pattern, is because expressJS does not allow middleware functions with more than 3 params, and for this config, we need to know the keyPrefix and the ttl. If we tried to add it to the direct middleware function, this would not work.
 *
 * So instead, we use a factory function, which can take as many args as needed, and then will return a middleware function with only 3 params, so that ExpressJS does not complain.
 */
// This is a middleware FACTORY, it returns a middleware function (not the middleware itself)
export const cacheMiddleware = (keyPrefix: string, ttl = 300) => {
    // This is the actual middleware that Express will call. Our outer function just configures it
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Build a cache key from route and user
            const userId = req.user?.id || "anonymous";
            const cacheKey = `${keyPrefix}:${userId}:${req.originalUrl}`;

            // Try to get cached data
            const cachedData = await RedisHelper.get<JsonValue>(cacheKey);

            if (cachedData) {
                console.info("Cache HIT: ", cacheKey);
                res.status(200).json({
                    success: true,
                    data: cachedData,
                    cached: true,
                    message: "Data retrieved from cache",
                } as IApiResponse);
                return;
            }

            // Else
            console.warn("Cache MISS: ", cacheKey);

            // Store original res.json to intercept response
            const originalJson = res.json.bind(res);
            // Override res.json to cache the response
            res.json = (data: IApiResponse) => {
                // Only cache successfull responses
                if (data.success && data.data) {
                    RedisHelper.set(
                        cacheKey,
                        data.data as JsonValue,
                        ttl
                    ).catch((err) => {
                        console.error("Cache save error: ", err);
                    });
                }
                return originalJson(data);
            };

            next(); // Important, otherwise we would not continue to the other middleware functions
        } catch (err) {
            // If redis fails, continue without caching
            console.error("Cache middleware error: ", err);
            next();
        }
    };
};

// Invalidate cache middleware - clears cache BEFORE mutations
// Example: If we create a new task, clear the cache first so subsequent reads get fresh data
export const invalidateCache = (pattern: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id || "anonymous";
            const cachePattern = `${pattern}:${userId}*`; // Add wildcard to match all keys with this prefix

            // Delete cache BEFORE the operation (not after)
            await RedisHelper.delPattern(cachePattern);
            console.info(`Cache invalidated: ${cachePattern}`);

            // IMPORTANT: Continue to the next middleware/controller
            next();
        } catch (err) {
            console.error("Cache invalidation error:", err);
            // Continue even if cache deletion fails (don't break the request)
            next();
        }
    };
};
