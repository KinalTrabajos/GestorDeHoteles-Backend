import {Schema, model} from "mongoose";

const CategorySchema = Schema({
    typeCategory : {
        type: String,
        required: [true, 'Type required'],
        maxLength: [50, 'Cant be overcome 50 characters']
    },
    description : {
        type: String,
        required: [true, 'description required'],
        maxLength: [200, 'Cant be overcome 200 characters']
    },
    keeperHotel: [{
        type: Schema.Types.ObjectId,
        ref: 'Hotel',
        required: false
    }],
    state: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
        versionKey: false,
    }
);

export default model('Category', CategorySchema);