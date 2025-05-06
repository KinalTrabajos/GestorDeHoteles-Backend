import { Schema, model} from "mongoose";

const ReservationSchema = Schema ({
    keeperUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    keeperRoom: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    datesReservation:{
        startDate: {
            type: Date,
            required: [true, 'Start date required']
        },
        endDate: {
            type: Date,
            required: [true, 'End date required']
        }
    },
    stateReservation: {
        type: String,
        required: true,
        enum: ['Pendiente', 'Confirmada', 'Cancelada'],
        default: 'Pendiente'
    },
    state: {
        type: Boolean,
        default: true
    }

},
{
    timestamps: true,
    versionKey: false
});

export default model ('Reservation', ReservationSchema);