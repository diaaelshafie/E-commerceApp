import { Router } from "express"
import * as userCont from './user.controller.js'
import { multerHostFunction } from "../../services/multerHost.js"
import { validationCoreFunction } from "../../middlewares/joiValidation.js"
import { asyncHandler } from "../../utilities/asyncHandler.js"
import * as userValidSchemas from './user.validationSchemas.js'
import { allowedExtensions } from "../../utilities/allowedUploadExtensions.js"
import { isAuth } from '../../middlewares/userMiddlewares/userAuth.js'
import { userAPIroles } from "./user.endPoints.js"

export {
    Router,
    asyncHandler,
    multerHostFunction,
    userCont,
    userValidSchemas,
    validationCoreFunction,
    allowedExtensions,
    isAuth,
    userAPIroles
}