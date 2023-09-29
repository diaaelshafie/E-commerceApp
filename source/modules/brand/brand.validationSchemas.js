import joi from 'joi'

export const addBrandValidationSchema = {
    body: joi.object({
        name: joi.string().required()
    }),
    query: joi.object({
        categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/),
        subCategoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/)
    }).options({ presence: 'required' }),
    file: joi.object({
        brandLogo: joi.object()
    }).presence('required').unknown(true)
}