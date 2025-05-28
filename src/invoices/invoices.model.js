import { Schema, model } from 'mongoose';

const InvoiceSchema = new Schema ({
    
},
{
    timestamps: true,
    versionKey: false
});

export default model ('Invoice', InvoiceSchema)