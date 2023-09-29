import {
    Router, couponCont, couponSchemas, asyncHandler, validationCoreFunction, isAuth,
    couponAPIroles
} from './coupon.routes.imports.js'

const router = Router()

router.post(
    '/addCoupon',
    isAuth(couponAPIroles.addCoupon),
    validationCoreFunction(couponSchemas.addCouponSchema),
    asyncHandler(couponCont.addCoupon)
)

router.delete(
    '/deleteCoupon',
    isAuth(couponAPIroles.deleteCouopon),
    validationCoreFunction(couponSchemas.deleteCouponSchema),
    asyncHandler(couponCont.deleteCoupon)
)

export default router