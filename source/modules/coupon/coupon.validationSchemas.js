import joi from 'joi'
import { generalFields } from '../../middlewares/joiValidation.js'

export const addCouponSchema = {
    body: joi.object({
        couponCode: joi.string().min(5).max(55).required(),
        couponValue: joi.number().positive().min(1).max(100).required(),
        fromDate: joi.date().greater(Date.now() - (24 * 60 * 60 * 1000)).required(), // Date in java script is in milliseconds
        toDate: joi.date().greater(joi.ref('fromDate')).required(),
        isPercentage: joi.boolean().optional(),
        isFixed: joi.boolean().optional()
    })
}

export const deleteCouponSchema = {
    query: joi.object({
        _id: generalFields._id.required()
    })
}

// 24 * 60 * 60 * 1000