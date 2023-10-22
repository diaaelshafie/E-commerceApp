import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const addBrandValidationSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true),
    body: joi.object({
        name: joi.string().required()
    }),
    query: joi.object({
        categoryId: generalFields._id,
        subCategoryId: generalFields._id
    }).options({ presence: 'required' }),
    file: joi.object({
        fieldname: joi.string().valid('brandLogo').required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().required(),
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        size: joi.number().required()
    }).options({ presence: 'required' }).unknown(true)
}

export const updateBrandValidationSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true),
    body: joi.object({
        name: joi.string()
    }).options({ presence: 'optional' }),
    query: joi.object({
        _id: generalFields._id.required(),
        newAdmin: generalFields._id.optional(),
        categoryId: generalFields._id.optional(),
        subCategoryId: generalFields._id.optional()
    }),
    file: joi.object({
        fieldname: joi.string().valid('brandLogo').required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi.string().required(),
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        size: joi.number().required()
    }).presence('optional').unknown(true)
}

export const getAllBrandsValidationSchema = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true),
    query: joi.object({
        page: joi.number(),
        size: joi.number()
    }).presence('required')
}

export const deleteBrand = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true),
}

export const forceDeleteBrand = {
    headers: joi.object({
        authorization: generalFields.jwtToken
    }).presence('required').unknown(true),
}