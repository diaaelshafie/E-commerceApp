import { Router } from "express"
import { multerHostFunction } from '../../services/multerHost.js'
import { allowedExtensions } from "../../utilities/allowedUploadExtensions.js"
import { asyncHandler } from "../../utilities/asyncHandler.js"
import * as categoryCont from './category.controller.js'
import { validationCoreFunction } from "../../middlewares/joiValidation.js"
import * as catValidSchemas from './category.validationSchemas.js'
import subCategoryRouter from '../subCategory/subCategory.routes.js'
import { isAuth } from '../../middlewares/userMiddlewares/userAuth.js'
import { categoryAPIroles } from "./category.endpoints.js"

export {
    Router,
    multerHostFunction,
    allowedExtensions,
    asyncHandler,
    catValidSchemas,
    categoryCont,
    validationCoreFunction,
    subCategoryRouter,
    isAuth,
    categoryAPIroles
}