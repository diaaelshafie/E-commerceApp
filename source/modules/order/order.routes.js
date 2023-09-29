import {
    Router, asyncHandler, orderCont, orderSchemas, validationCoreFunction, isAuth, orderAPIroles
} from './order.routes.imports.js'

const router = Router()

router.post(
    '/createOrder',
    isAuth(orderAPIroles.createOrder),
    asyncHandler(orderCont.createOrder)
)

router.post(
    '/convertCartToOrder',
    isAuth(orderAPIroles.convertCartToOrder),
    asyncHandler(orderCont.convertCartToOrder)
)

export default router