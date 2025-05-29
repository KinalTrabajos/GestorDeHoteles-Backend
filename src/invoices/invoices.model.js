import { Schema, model } from 'mongoose';

const InvoiceSchema = new Schema ({
    reservationPrivate : {
        type: Object,
        required: false
    },
    state : {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true,
    versionKey: false
});

export default model ('Invoice', InvoiceSchema)