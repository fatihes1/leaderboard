import { PrismaClient } from '@prisma/client'

class BaseService<T extends string> {
    protected prisma: PrismaClient
    private model: T

    constructor(model: T) {
        this.prisma = new PrismaClient()
        this.model = model
    }

    async list(where = {}, select?: Record<string, boolean>, orderBy?: Record<string, 'asc' | 'desc'>) {
        return (this.prisma[this.model as keyof PrismaClient] as any).findMany({
            where,
            select,
            orderBy
        })
    }

    async create(data: any) {
        return (this.prisma[this.model as keyof PrismaClient] as any).create({
            data
        })
    }

    async findOne(where: any, select?: Record<string, boolean>) {
        return (this.prisma[this.model as keyof PrismaClient] as any).findFirst({
            where,
            select
        })
    }

    async findById(id: number) {
        return (this.prisma[this.model as keyof PrismaClient] as any).findUnique({
            where: { id }
        })
    }

    async update(id: number, data: any) {
        return (this.prisma[this.model as keyof PrismaClient] as any).update({
            where: { id },
            data
        })
    }

    async updateWhere(where: any, data: any) {
        return (this.prisma[this.model as keyof PrismaClient] as any).update({
            where,
            data
        })
    }

    async delete(id: number) {
        return (this.prisma[this.model as keyof PrismaClient] as any).delete({
            where: { id }
        })
    }

    async transaction<P>(cb: (tx: any) => Promise<P>): Promise<P> {
        return this.prisma.$transaction(cb)
    }

    async disconnect() {
        await this.prisma.$disconnect()
    }
}

export default BaseService;