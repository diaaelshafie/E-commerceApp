import { Router } from 'express'
import * as brandCont from './brand.controller.js'
import { asyncHandler } from '../../utilities/asyncHandler.js'
import { multerHostFunction } from '../../services/multerHost.js'
import { allowedExtensions } from '../../utilities/allowedUploadExtensions.js'
import { validationCoreFunction } from '../../middlewares/joiValidation.js'
import { checkNewBrandData } from '../../middlewares/brandMiddlewares/brandChecks.js'
import * as brandvalidSchemas from './brand.validationSchemas.js'
import { isAuth } from '../../middlewares/userMiddlewares/userAuth.js'
import { brandAPIroles } from './brand.endPoints.js'

export {
    Router,
    brandCont,
    asyncHandler,
    multerHostFunction,
    allowedExtensions,
    validationCoreFunction,
    checkNewBrandData,
    brandvalidSchemas,
    isAuth,
    brandAPIroles
}