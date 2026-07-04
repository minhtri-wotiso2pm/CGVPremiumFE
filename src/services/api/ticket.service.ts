import axiosInstance from "@/services/axios/axiosInstance";
import type { Ticket } from "@/features/booking/types/ticket.types";

export const getTicketsByBookingApi = async (bookingId: number): Promise<Ticket[]> => {
    const { data } = await axiosInstance.get(`/tickets/booking/${bookingId}`);
    const list: Record<string, unknown>[] = Array.isArray(data)
        ? data
        : (data?.tickets ?? []);
    return list.map((t) => ({
        ticketID: Number(t.ticketID ?? t.ticketId ?? 0),
        bookingSeatID: Number(t.bookingSeatID ?? t.bookingSeatId ?? 0),
        qrCode: String(t.qrCode ?? ""),
        status: String(t.status ?? "valid"),
        checkedInAt: (t.checkedInAt ?? null) as string | null,
        checkedInByID: (t.checkedInByID ?? null) as number | null,
    }));
};
