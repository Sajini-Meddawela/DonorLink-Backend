import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CareHomeController = {
  async getCareHomes(req: Request, res: Response) {
    try {
      const { search, category, location } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { registrationNo: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (category) {
        where.category = category;
      }

      if (location) {
        where.address = { contains: location as string, mode: 'insensitive' };
      }

      const [careHomes, total] = await Promise.all([
        prisma.careHome.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            registrationNo: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            category: true
          }
        }),
        prisma.careHome.count({ where })
      ]);

      res.json({
        data: careHomes,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch care homes' });
    }
  },

  async getCareHomeDetails(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid care home ID' });
      }

      const careHome = await prisma.careHome.findUnique({
        where: { id },
        select: {
          id: true,
          registrationNo: true,
          name: true,
          address: true,
          phone: true,
          email: true,
          category: true
        }
      });

      if (!careHome) {
        return res.status(404).json({ error: 'Care home not found' });
      }

      res.json(careHome);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch care home details' });
    }
  }
};