import { Schema, model } from "mongoose"

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
        lowercase: true
    },
    desc: String,
    slug: {
        type: String,
        required: true,
        lowercase: true
    },
    colors: [String],
    sizes: [Number],
    price: {
        type: Number,
        required: true,
        default: 1
    },
    appliedDiscount: {
        type: Number,
        default: 0
    },
    priceAfterDiscount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    customId: String,
    images: [{
        secure_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

export const productModel = model('Product', productSchema)