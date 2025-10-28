import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

// Connect this memory server before all tests run
export const connectTestDB = async () => {
    process.env.JWT_SECRET = "test-secret-key-for-testing";
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log("Database connected!");
};

// Clear database between tests
export const clearTestDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

// Disconnect after all tests have run
export const disconnectTestDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};
