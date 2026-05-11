import { Worker } from "bullmq";
import { redis } from "../../config/redisClient";

export const cacheWorker = new Worker(
  "cache-invalidation",
  async (job) => {
    const { pattern } = job.data;
    await invalidateCache(pattern);
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 jobs concurrently
  }
);

cacheWorker.on("completed", (job) => {
  console.log(`Job with ID ${job.id} has been completed`);
});

cacheWorker.on("failed", (job, err) => {
  console.log(`Job with ID ${job?.id} has failed with error ${err.message}`);
});

const invalidateCache = async (pattern: string) => {
  try {
    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    });

    const pipeline = redis.pipeline();
    let totalKeys = 0;

    // Process keys in batches
    stream.on("data", (keys: string[]) => {
      if (keys.length > 0) {
        keys.forEach((key) => {
          pipeline.del(key);
          totalKeys++;
        });
      }
    });

    // Wrap stream events in a Promise
    await new Promise<void>((resolve, reject) => {
      stream.on("end", async () => {
        try {
          if (totalKeys > 0) {
            await pipeline.exec();
            console.log(`Invalidated ${totalKeys} keys`);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      stream.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.log("Cache Invalidatino error: ", error);
    throw error;
  }
};
