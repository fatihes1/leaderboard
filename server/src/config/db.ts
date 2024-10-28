import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas'

const prisma = new PrismaClient().$extends(
    readReplicas({
        url: process.env.DATABASE_REPLICA_URL || '',
    })
);

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("🥳 DB Connection Completed!");
    } catch (error) {
        console.error("🥲 DB Connection Failed!", error);
        process.exit(1);
    }
};

export { connectDB, prisma };
