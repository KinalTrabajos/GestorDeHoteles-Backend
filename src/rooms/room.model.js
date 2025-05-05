import { Schema, model } from "mongoose";

const RoomChema = Schema({
    typeRoom: {
        type: String,
        required: [true, 'Room Type required'],
        maxLength: [25, 'Cant be overcome 25 characters']
    },
    descriptionRoom: {
        type: String,
        required: [true, 'Description required'],
        maxLength: [200, 'Cant be overcome 200 characters']
    },
    capacityRoom:{
        type: Number,
        required: [true, 'Capacity required'],
        min: [1, 'Minimum capacity is 1'],
        max: [10, 'Maximum capacity is 10']
    },
    priceRoom: {
        type: Number,
        required: [true, 'Price required'],
        min: [1, 'Price must be greater than 1']
    },
    datesAvialableRoom: [
        {
            date : {
                type: Date,
                required: [true, 'Date required']
            },
            availabilityRoom: {
                type: Boolean,
                default: true
            }
        },
    ],
    keeperHotel: {
        type: Schema.Types.ObjectId,
        ref: 'Hotel',
        required: false
    },
    keeperAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
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

export default model('Room', RoomChema);