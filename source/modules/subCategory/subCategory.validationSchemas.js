import joi from 'joi'

export const createSubCategorySchema = {
    body: joi.object({
        name: joi.string().required()
    }),
    params: joi.object({
        categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/)
    }).presence('required'),
    file: joi.object({
        subCategoryImage: joi.object()
    }).unknown()
}