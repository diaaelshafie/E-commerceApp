// category data base model :

import { Schema, model } from "mongoose";

const couponSchema = new Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    couponValue: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
        default: 10
    },
    isPrecentage: {
        type: Boolean,
        required: true,
        default: false
    },
    isFixed: {
        type: Boolean,
        required: true,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    couponAssignedToUsers: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            maxUsage: {
                type: Number,
                required: true,
                default: 1,
                min: 1,
                max: 100
            },
            usageCount: {
                type: Number,
                default: 0
            }
        }
    ],
    fromDate: {
        type: String,
        required: true
    },
    toDate: {
        type: String,
        required: true
    },
    couponState: {
        type: String,
        required: true,
        enum: ['expired', 'valid'],
        default: 'valid'
    }
}, {
    timestamps: true,
})

export const couponModel = model('Coupon', couponSchema)