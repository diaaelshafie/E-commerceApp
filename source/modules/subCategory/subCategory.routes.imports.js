import { Router } from "express"
import * as subCatCont from './subCategory.controller.js'
import { multerHostFunction } from "../../services/multerHost.js"
import { validationCoreFunction } from "../../middlewares/joiValidation.js"
import { allowedExtensions } from "../../utilities/allowedUploadExtensions.js"
import * as subCatVSchemas from './subCategory.validationSchemas.js'
import { asyncHandler } from '../category/category.routes.imports.js'
import { isAuth } from '../../middlewares/userMiddlewares/userAuth.js'
import { subCategoryAPIroles } from "./subCategory.endPoints.js"

export {
    Router,
    subCatCont,
    subCatVSchemas,
    multerHostFunction,
    validationCoreFunction,
    allowedExtensions,
    asyncHandler,
    isAuth,
    subCategoryAPIroles
}