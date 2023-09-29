import { Router } from 'express'
import * as productCont from './product.controller.js'
import { asyncHandler } from '../../utilities/asyncHandler.js'
import { multerHostFunction } from '../../services/multerHost.js'
import { allowedExtensions } from '../../utilities/allowedUploadExtensions.js'
import * as productValidSchemas from './product.validationSchemas.js'
import { validationCoreFunction } from '../../middlewares/joiValidation.js'
import { checkNewProdcutData } from '../../middlewares/productMiddlewares/productChecks.js'
import { isAuth } from '../../middlewares/userMiddlewares/userAuth.js'
import { productAPIroles } from './product.endPoints.js'

export {
    Router,
    productCont,
    asyncHandler,
    multerHostFunction,
    allowedExtensions,
    productValidSchemas,
    validationCoreFunction,
    checkNewProdcutData,
    isAuth,
    productAPIroles
}