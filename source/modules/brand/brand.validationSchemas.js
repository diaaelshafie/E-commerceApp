import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const addBrandValidationSchema = {
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