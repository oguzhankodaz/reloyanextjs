import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

// Neon serverless driver ile connection pooling
const sql = neon(process.env.DATABASE_URL!);

const prisma = globalForPrisma.prisma || new PrismaClient({
    // Connection pooling için optimizasyonlar
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Neon serverless için özel ayarlar
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
export { sql } // Neon SQL driver'ı da export ediyoruz