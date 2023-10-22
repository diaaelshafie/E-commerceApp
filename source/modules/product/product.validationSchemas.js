import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const addProductValidationSchema = {
    body: joi.object({
        title: joi.string().required(),
        stock: joi.number().required(),
        price: joi.number().required(),
        desc: joi.string().optional(),
        colors: joi.array().items(joi.string()).optional(),
        sizes: joi.array().items(joi.number()).optional(),
        appliedDiscount: joi.number().optional()
    }),
    query: joi.object({
        categoryId: generalFields._id,
        subCategoryId: generalFields._id,
        brandId: generalFields._id,
    }).presence('required'),
    files: joi.array().items(joi.object({
        fieldname: joi.string().valid('images'),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    })).max(3).options({ allowUnknown: true })
    // files: joi.object({
    //     images: joi.array().items(joi.object().unknown(true)).max(3).required()
    // }).options({ allowUnknown: true })
}

export const updateProductValidationSchema = {
    body: joi.object({
        title: joi.string(),
        stock: joi.number(),
        price: joi.number(),
        desc: joi.string(),
        colors: joi.array().items(joi.string()),
        sizes: joi.array().items(joi.number()),
        appliedDiscount: joi.number()
    }).presence('optional'),
    query: joi.object({
        productId: generalFields._id.required(),
        categoryId: generalFields._id.optional(),
        subCategoryId: generalFields._id.optional(),
        brandId: generalFields._id.optional(),
    }),
    files: joi.array().items(joi.object({
        fieldname: joi.string().valid('images'),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    })).max(3).options({ allowUnknown: true }).optional()
}

export const deleteProductValidationSchema = {
    query: joi.object({
        _id: generalFields._id
    }).presence('required')
}