import { Schema, model} from "mongoose";

const ReservationEventSchema = Schema ({
    keeperUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    keeperEvent: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
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

export default model ('ReservationEvent', ReservationEventSchema);