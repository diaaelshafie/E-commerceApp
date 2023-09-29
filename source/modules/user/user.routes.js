import {
    Router, asyncHandler, multerHostFunction, userCont, userValidSchemas, validationCoreFunction,
    isAuth, userAPIroles, allowedExtensions
} from './user.routes.imports.js'

const router = Router()


export default router