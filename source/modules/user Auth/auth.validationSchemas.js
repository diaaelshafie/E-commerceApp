import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'
const { allow } = joi

export const signUpSchema = {
    body: joi.object({
        userName: joi.string().required(),
        email: generalFields.email,
        password: joi.string().required(),
        phoneNumber: joi.string().required(),
        address: joi.array().items(joi.string().required()),
        gender: joi.string().valid('male', 'female', 'notSpecified', '').optional(),
        age: joi.number()
    }),
    file: joi.object({
        fieldname: joi.string(),
        originalname: joi.string(),
        encoding: joi.string(),
        mimetype: joi.string(),
        destination: joi.string(),
        filename: joi.string(),
        path: joi.string(),
        size: joi.number()
    }).unknown(true)
}

export const logInSchema = {
    body: joi.object({
        email: generalFields.email,
        password: joi.string()
    }).presence('required')
}

export const forgetPassSchema = {
    body: joi.object({
        email: generalFields.email,
    }).presence('required')
}

export const resetPasswordSchema = {
    params: joi.object({
        token: generalFields.jwtToken
    }),
    body: joi.object({
        newPassword: joi.string().required()
    })
}