import dayjs from "dayjs";
import Reservation from "../reservations/reservation.model.js";
import ReservationEvent from "../reservations/reservationEvent.model.js";
import Room from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.model.js";

export const mostRequestedHotels = async (req, res) => {
    try {
        // Obtener reservas de habitaciones
        const roomReservations = await Reservation.find({
            stateReservation: "Confirmada",
        }).populate({
            path: "keeperRoom",
            populate: { path: "keeperHotel", select: "nameHotel" },
        });

        // Obtener reservas de eventos
        const eventReservations = await ReservationEvent.find({
            stateReservation: "Confirmada",
        }).populate({
            path: "keeperEvent",
            populate: { path: "keeperHotel", select: "nameHotel" },
        });

        const counter = {}; // { hotelId: { totalReservations, hotelName } }

        for (const res of roomReservations) {
            const hotel = res.keeperRoom?.keeperHotel;
            if (!hotel) continue;
            const id = hotel._id.toString();
            counter[id] = counter[id] || {
                hotelId: id,
                hotelName: hotel.nameHotel || "Desconocido",
                totalReservations: 0,
            };
            counter[id].totalReservations++;
        }

        for (const res of eventReservations) {
            const hotel = res.keeperEvent?.keeperHotel;
            if (!hotel) continue;
            const id = hotel._id.toString();
            counter[id] = counter[id] || {
                hotelId: id,
                hotelName: hotel.nameHotel || "Desconocido",
                totalReservations: 0,
            };
            counter[id].totalReservations++;
        }

        const result = Object.values(counter).sort(
            (a, b) => b.totalReservations - a.totalReservations
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({
            message: "Error generating statistics",
            error: error.message,
        });
    }
};

export const monthlyOccupancy = async (req, res) => {
    try {
        const reservations = await Reservation.find({
            stateReservation: "Confirmada",
        }).populate({
            path: "keeperRoom",
            populate: { path: "keeperHotel", select: "nameHotel" },
        });

        const occupancy = {}; // { hotelId: { month: count, name: "" } }
        const roomsByHotel = {}; // Conteo de habitaciones por hotel

        for (const resv of reservations) {
            const hotel = resv.keeperRoom?.keeperHotel;
            if (!hotel) continue;

            const hotelId = hotel._id.toString();
            const hotelName = hotel.nameHotel || "Desconocido";

            if (!roomsByHotel[hotelId]) {
                roomsByHotel[hotelId] = 1; // Reemplazar con conteo real si se necesita exactitud
            }

            const start = dayjs(resv.datesReservation.startDate);
            const end = dayjs(resv.datesReservation.endDate);

            for (let d = start; d.isBefore(end); d = d.add(1, "day")) {
                const month = d.format("YYYY-MM");
                occupancy[hotelId] = occupancy[hotelId] || {};
                occupancy[hotelId][month] = occupancy[hotelId][month] || {
                    hotelId,
                    hotelName,
                    month,
                    totalOccupied: 0,
                };
                occupancy[hotelId][month].totalOccupied++;
            }
        }

        const report = [];

        for (const hotelId in occupancy) {
            const months = occupancy[hotelId];
            const roomCount = roomsByHotel[hotelId] || 1;

            for (const month in months) {
                const entry = months[month];
                const daysInMonth = dayjs(`${month}-01`).daysInMonth();
                const maxOccupancy = daysInMonth * roomCount;

                report.push({
                    hotelId,
                    hotelName: entry.hotelName,
                    month,
                    occupancyPercentage: parseFloat(
                        ((entry.totalOccupied / maxOccupancy) * 100).toFixed(2)
                    ),
                });
            }
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({
            message: "Error generating monthly occupancy report",
            error: error.message,
        });
    }
};
