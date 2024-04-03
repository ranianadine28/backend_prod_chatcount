
import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const fecSchema = new Schema({
    name: {
        type: String
    },
    data: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user' // Référence au modèle User
    }
}, {
    timestamps: true
});

export default mongoose.model('Fec', fecSchema);