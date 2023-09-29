import {
    Router, asyncHandler, cartCont, cartSchemas, isAuth, validationCoreFunction,
    cartAPIroles
} from './cart.routes.imports.js'

const router = Router()

router.post(
    '/addCart',
    isAuth(cartAPIroles.ADDCART),
    asyncHandler(cartCont.addToCart)
)

router.delete(
    '/deleteFromCart',
    isAuth(cartAPIroles.DELETEFROMCART),
    asyncHandler(cartCont.deleteFromCart)
)

export default router