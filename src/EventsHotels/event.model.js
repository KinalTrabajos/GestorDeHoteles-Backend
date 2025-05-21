import  { Schema, model } from 'mongoose';

const EventSchema = Schema({
    nameEvent: {
        type: String,
        required: [true, 'Name required'],
        maxLength: [25, 'Cant be overcome 25 characters']
    },
    description: {
        type: String,
        required: [true, 'Description required'],
        maxLength: [200, 'Cant be overcome 200 characters']
    },
    datesEvent: {
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    },
    keeperHotel: {
        type: Schema.Types.ObjectId,
        ref: 'Hotel',
        required: false
    },
    additionalServices: [
        {
            typeService: {
                type: String,
                required: [true, 'Type of service required'],
                maxLength: [25, 'Cant be overcome 25 characters']
            },
            descriptionServices: {
                type: String,
                required: [true, 'Description required'],
                maxLength: [200, 'Cant be overcome 200 characters']
            },
            priceService: {
                type: Number,
                required: [true, 'Price required'],
                min: [1, 'Price must be greater than 1']
            }
        }
    ],
    typeEvent: {
        type: String,
        required: [true, 'Type of event required'],
        enum: ['Evento_General', 'Evento_Privado'],
        default: 'Evento_General'
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

export default model('Event', EventSchema);