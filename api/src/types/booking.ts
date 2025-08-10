export interface BookingRequest {
  slotId: string;
}

export interface SlotResponse {
  id: string;
  startAt: string;
  endAt: string;
  available: boolean;
}

export interface BookingResponse {
  id: string;
  userId: string;
  slotId: string;
  createdAt: string;
  slot: {
    id: string;
    startAt: string;
    endAt: string;
  };
}

export interface AdminBookingResponse extends BookingResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}