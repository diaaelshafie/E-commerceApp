import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const addCategorySchema = {
    body: joi.object({
        name: joi.string()
    }),
    file: joi.object({
        fieldname: joi.string().valid('categoryImage'),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).unknown(true).options({ presence: 'required' })
}

export const updateCategorySchema = {
    body: joi.object({
        name: joi.string().optional()
    }),
    file: joi.object({
        fieldname: joi.string().valid('categoryImage'),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).unknown(true).options({ presence: 'optional' })
}