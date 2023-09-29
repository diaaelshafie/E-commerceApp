// sub cateory data base model :

import { Schema, model } from "mongoose"

const subCategorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    slug: {
        type: String,
        lowercase: true,
        required: true
    },
    image: {
        secure_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    customId: String
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

subCategorySchema.virtual('brands', {
    ref: 'Brand',
    foreignField: 'subCategoryId',
    localField: '_id'
})

export const subCategoryModel = model('SubCategory', subCategorySchema)