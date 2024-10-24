import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
