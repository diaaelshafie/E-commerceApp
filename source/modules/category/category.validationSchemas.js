import joi from 'joi'

export const addCategorySchema = {
    body: joi.object({
        name: joi.string()
    }),
    file: joi.object({
        categoryImage: joi.object().required()
    }).unknown()
}

export const updateCategorySchema = {
    body: joi.object({
        name: joi.string().optional()
    }),
    file: joi.object({
        categoryImage: joi.object().optional()
    }).options({ allowUnknown: true })
}