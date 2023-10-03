import { Schema, model } from "mongoose"

const reviewSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    review: {
        type: String
    },
    reviewRate: {
        type: Number,
        default: 0,
        max: 5,
        enum: [0, 1, 2, 3, 4, 5],
        required: true
    }
}, {
    timestamps: true
})

export const reviewModel = model('Review', reviewSchema)