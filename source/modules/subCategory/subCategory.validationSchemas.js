import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const createSubCategorySchema = {
    body: joi.object({
        name: joi.string().required()
    }),
    params: joi.object({
        categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/)
    }).presence('required'),
    file: joi.object({
        fieldname: joi.string().valid('subCategoryImage'),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).unknown(true).optional()
}

export const updateSubCategorySchema = {
    body: joi.object({
        name: joi.string()
    }).presence('optional'),
    query: joi.object({
        categoryId: generalFields._id,
        _id: generalFields._id
    }).presence('optional'),
    file: joi.object({
        fieldname: joi.string().valid('subCategoryImage'),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).unknown(true).options({ presence: 'optional' })
}

export const deleteSubCategorySchema = {
    query: joi.object({
        _id: generalFields._id
    })
}