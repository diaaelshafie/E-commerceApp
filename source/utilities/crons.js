import { scheduleJob } from "node-schedule"
import { couponModel } from '../DB/models/coupon.model.js'
import moment from 'moment-timezone'

export const changeCouponStatus = () => {
    scheduleJob('* */60 * * * *', async function () {
        const validCoupons = await couponModel.find({ couponState: 'valid' })
        // console.log(validCoupons)
        for (const coupon of validCoupons) {
            // console.log({
            //     momentToDate: moment(coupon.toDate),
            //     now: moment(),
            //     condition: moment(coupon.toDate).isBefore(moment())
            // })
            if (moment(coupon.toDate).tz('Africa/Cairo').isBefore(moment().tz('Africa/Cairo'))) {
                coupon.couponState = 'expired'
            }
            await coupon.save() // can be made inside the if statement also
        }
        console.log('cron : changeCouponStatus is running')
    })
}