import {
    couponModel, userModel
} from './coupon.controller.imports.js'

export const addCoupon = async (req, res, next) => {
    const {
        couponCode, couponValue, fromDate, toDate, isPercentage, isFixed,
        couponAssignedToUsers
    } = req.body

    if (await couponModel.findOne({ couponCode })) {
        return next(new Error('coupon code already exists , duplicates!', { cause: 400 }))
    }

    if ((!isFixed && !isPercentage) ||
        (isFixed == undefined && isPercentage == undefined) ||
        (isFixed && isPercentage)) {
        return next(new Error("the coupon's value must be either a percentage or a fixed amount!", { cause: 400 }))
    }
    // if (typeof (isFixed) !== Boolean || typeof (isPercentage) !== Boolean) {
    //     return next(new Error("wrong discount format", { cause: 400 }))
    // }

    if (couponAssignedToUsers) {
        console.log({ couponAssignedToUsers })
        let usersIds = []
        for (const user of couponAssignedToUsers) {
            usersIds.push(user.userId)
        }
        const usersCheck = await userModel.find({
            _id: { $in: usersIds }
        })
        console.log(usersCheck)
        if (usersIds !== usersCheck.length) {
            return next(new Error('invalid users ids!', { cause: 400 }))
        }
    }

    const couponObject = {
        couponCode, couponValue, fromDate, toDate, isPercentage, isFixed,
        couponAssignedToUsers, createdBy: req.authUser._id
    }

    const saveCoupon = await couponModel.create(couponObject)
    if (!saveCoupon) {
        return next(new Error('coupon save failure', { cause: 400 }))
    }
    res.status(200).json({
        message: "done",
        coupon: saveCoupon
    })
}

export const deleteCoupon = async (req, res, next) => {
    const { _id } = req.query
    const userId = req.authUser._id
    const isCouponCodeDuplicated = await couponModel.findOneAndDelete({
        _id,
        createdBy: userId
    })
    if (!isCouponCodeDuplicated) {
        return next(new Error('invalid couponId', { cause: 400 }))
    }
    res.status(201).json({
        message: "done!",
        couponDeleted: isCouponCodeDuplicated
    })
}