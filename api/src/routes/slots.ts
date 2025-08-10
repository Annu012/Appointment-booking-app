import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { SlotResponse } from '../types/booking';

const router = Router();
const prisma = new PrismaClient();

// Get available slots
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Default to next 7 days if no date range provided
    const fromDate = from ? new Date(from as string) : new Date();
    const toDate = to ? new Date(to as string) : (() => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    })();

    // Ensure we're working with UTC dates
    fromDate.setUTCHours(0, 0, 0, 0);
    toDate.setUTCHours(23, 59, 59, 999);

    const slots = await prisma.slot.findMany({
      where: {
        startAt: {
          gte: fromDate,
          lte: toDate
        }
      },
      include: {
        booking: true
      },
      orderBy: {
        startAt: 'asc'
      }
    });

    const slotsResponse: SlotResponse[] = slots.map(slot => ({
      id: slot.id,
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
      available: !slot.booking
    }));

    res.json(slotsResponse);
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch slots'
      }
    });
  }
});

export { router as slotsRoutes };