// this validation is for the "createOrderApi" in order controller
import { couponModel } from "../DB/models/coupon.model.js"
import moment from 'moment-timezone'

export const isCouponValid = async ({ couponCode, userId, next } = {}) => {
    const coupon = await couponModel.findOne({ couponCode })
    if (!couponCode) {
        return next(new Error('please enter a valid coupon code!', { cause: 400 }))
    }
    if (coupon.couponState == 'expired' ||
        moment(coupon.toDate).tz('Africa/Cairo').isBefore(moment().tz('Africa/Cairo'))) {
        return next(new Error('the entered coupon is expired!', { cause: 400 }))
    }
    if (coupon.couponState == 'valid' ||
        moment().tz('Africa/Cairo').isBefore(moment(new Date(coupon.fromDate)).tz('Africa/Cairo'))) {
        return next(new Error("the entered coupon didn't start!", { cause: 400 }))
    }

    // first method : (my method)
    let flag = false
    for (const user of coupon.couponAssignedToUsers) {
        if (userId.toString() == user.userId.toString()) {
            flag = true
            if (user.usageCount >= user.maxUsage) {
                return next(new Error('coupon maximumly used!', { cause: 400 }))
            }
        }
    }
    if (!flag) {
        return next(new Error('the coupon is not assigned to the user', { cause: 400 }))
    }

    // another method :
    // let notAssignedUsers = []
    // let exceedUsage = false
    // for (const user of coupon.couponAssignedToUsers) {
    //     notAssignedUsers.push(user.userId.toString())
    //     if (userId.toString() == user.userId.toString()) {
    //         if (user.usageCount >= user.maxUsage) {
    //             exceedUsage = true
    //         }
    //     }
    // }
    // if (!notAssignedUsers.includes(userId)) {
    //     return {
    //         msg: "this User isn't assigned for this coupon !"
    //     }
    // }
    // if (exceedUsage == true) {
    //     return {
    //         msg: "this User has exceeded the max usage !"
    //     }
    // }
    return true
}