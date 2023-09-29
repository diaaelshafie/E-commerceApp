import {
    Router, brandCont, asyncHandler, multerHostFunction, allowedExtensions,
    validationCoreFunction, checkNewBrandData, brandvalidSchemas, isAuth, brandAPIroles
} from './brand.routes.imports.js'

const router = Router()

router.post(
    '/addBrand',
    isAuth(brandAPIroles.ADDBRAND),
    multerHostFunction(allowedExtensions.image).single('brandLogo'),
    checkNewBrandData(),
    validationCoreFunction(brandvalidSchemas.addBrandValidationSchema),
    asyncHandler(brandCont.addBrand)
)

export default router