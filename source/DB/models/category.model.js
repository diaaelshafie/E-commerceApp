// category data base model :

import { Schema, model } from "mongoose";

const categorySchema = new Schema({
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
    // customId will be the name of the category folder (contains image of the category) on the media host
    customId: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// to create a virtual , use the method `virtual` not 'virtuals'
categorySchema.virtual('subCategories', {
    ref: 'SubCategory',
    // the field that connects this collection in the child one
    foreignField: 'categoryId',
    // the name of that field connecting the 2 collections here in the parent
    localField: '_id',
    // additional optional field (justOne) -> it's false by default it will take only the first data element it will find for the virtual .
    // justOne: true
})

export const categoryModel = model('Category', categorySchema)