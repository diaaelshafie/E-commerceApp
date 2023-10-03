import {
    Router, asyncHandler, multerHostFunction, validationCoreFunction, allowedExtensions,
    isAuth, userAPIroles
} from '../user/user.routes.imports.js'
import { signUpChecks } from '../../middlewares/userMiddlewares/authChecks.js'
import * as authCont from './auth.controller.js'
import * as authValidSchemas from './auth.validationSchemas.js'
import { authAPIroles } from './auth.endPoints.js'

const router = Router()

router.post(
    '/signUp',
    multerHostFunction(allowedExtensions.image).single('userImage'),
    signUpChecks(),
    validationCoreFunction(authValidSchemas.signUpSchema),
    asyncHandler(authCont.signUp)
)

router.get(
    '/confirmAccount:confirmToken',
    asyncHandler(authCont.confirmAccount)
)

router.post(
    '/logIn',
    // validationCoreFunction(authValidSchemas.logInSchema),
    asyncHandler(authCont.logIn)
)

router.patch(
    '/forgetPassword',
    isAuth(authAPIroles.forgetPassword),
    validationCoreFunction(authValidSchemas.forgetPassSchema),
    asyncHandler(authCont.forgetPassword)
)

router.patch(
    '/resetPassword:token',
    isAuth(authAPIroles.resetPassword),
    validationCoreFunction(authValidSchemas.resetPasswordSchema),
    asyncHandler(authCont.resetPassword)
)

router.post(
    '/loginWithGoogle',
    asyncHandler(authCont.loginWithGoogle)
)

export default router