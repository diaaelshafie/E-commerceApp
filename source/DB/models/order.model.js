import { Schema, model } from "mongoose"


const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            finalPrice: {
                type: Number,
                required: true
            }
        }
    ],
    subTotal: {
        type: Number,
        required: true,
        default: 0
    },
    couponId: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    paidAmount: {
        type: Number,
        required: true,
        default: 0
    },
    address: {
        type: String,
        required: true,
        max: 1
    },
    phone: [
        {
            type: String,
            required: true
        }
    ],
    orderStatus: {
        type: String,
        enum: ['pending', 'placed', 'delivered', 'rejected'
            , 'confirmed', 'on way', 'preparation', 'cancelled']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['visa', 'paypal', 'cash', 'stripe']
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reason: String,
}, {
    timestamps: true
})

export const orderModel = model('Order', orderSchema)