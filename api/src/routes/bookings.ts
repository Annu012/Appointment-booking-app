import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validate, bookingSchema } from '../middleware/validation';
import { BookingRequest, BookingResponse, AdminBookingResponse } from '../types/booking';

const router = Router();
const prisma = new PrismaClient();

// Book a slot (patients only)
router.post('/book', authenticateToken, requireRole('patient'), validate(bookingSchema), async (req, res) => {
  try {
    const { slotId }: BookingRequest = req.body;
    const { userId } = (req as AuthenticatedRequest).user;

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check if slot exists
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
        include: { booking: true }
      });

      if (!slot) {
        throw new Error('SLOT_NOT_FOUND');
      }

      if (slot.booking) {
        throw new Error('SLOT_TAKEN');
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          slotId
        },
        include: {
          slot: true
        }
      });

      return booking;
    });

    const response: BookingResponse = {
      id: result.id,
      userId: result.userId,
      slotId: result.slotId,
      createdAt: result.createdAt.toISOString(),
      slot: {
        id: result.slot.id,
        startAt: result.slot.startAt.toISOString(),
        endAt: result.slot.endAt.toISOString()
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Booking error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'SLOT_NOT_FOUND') {
        return res.status(404).json({
          error: {
            code: 'SLOT_NOT_FOUND',
            message: 'Slot not found'
          }
        });
      }
      
      if (error.message === 'SLOT_TAKEN') {
        return res.status(409).json({
          error: {
            code: 'SLOT_TAKEN',
            message: 'Slot already booked'
          }
        });
      }
    }

    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: {
            code: 'SLOT_TAKEN',
            message: 'Slot already booked'
          }
        });
      }
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create booking'
      }
    });
  }
});

// Get current user's bookings (patients only)
router.get('/my-bookings', authenticateToken, requireRole('patient'), async (req, res) => {
  try {
    const { userId } = (req as AuthenticatedRequest).user;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        slot: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: BookingResponse[] = bookings.map(booking => ({
      id: booking.id,
      userId: booking.userId,
      slotId: booking.slotId,
      createdAt: booking.createdAt.toISOString(),
      slot: {
        id: booking.slot.id,
        startAt: booking.slot.startAt.toISOString(),
        endAt: booking.slot.endAt.toISOString()
      }
    }));

    res.json(response);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch bookings'
      }
    });
  }
});

// Get all bookings (admin only)
router.get('/all-bookings', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        slot: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: AdminBookingResponse[] = bookings.map(booking => ({
      id: booking.id,
      userId: booking.userId,
      slotId: booking.slotId,
      createdAt: booking.createdAt.toISOString(),
      user: booking.user,
      slot: {
        id: booking.slot.id,
        startAt: booking.slot.startAt.toISOString(),
        endAt: booking.slot.endAt.toISOString()
      }
    }));

    res.json(response);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch bookings'
      }
    });
  }
});

export { router as bookingsRoutes };