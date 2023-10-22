import {
    Router, brandCont, asyncHandler, multerHostFunction, allowedExtensions,
    validationCoreFunction, brandvalidSchemas, isAuth, brandAPIroles
} from './brand.routes.imports.js'

const router = Router()

router.post(
    '/addBrand',
    isAuth(brandAPIroles.ADDBRAND),
    multerHostFunction(allowedExtensions.image).single('brandLogo'),
    validationCoreFunction(brandvalidSchemas.addBrandValidationSchema),
    asyncHandler(brandCont.addBrand)
)

router.get(
    '/getAllBrands',
    isAuth(brandAPIroles.getAllBrands),
    validationCoreFunction(brandvalidSchemas.getAllBrandsValidationSchema),
    asyncHandler(brandCont.getAllBrands)
)

router.put(
    '/updateBrand',
    isAuth(brandAPIroles.updateBrand),
    multerHostFunction(allowedExtensions.image).single('brandLogo'),
    validationCoreFunction(brandvalidSchemas.updateBrandValidationSchema),
    asyncHandler(brandCont.updateBrand)
)

router.delete(
    '/deleteBrand',
    isAuth(brandAPIroles.deleteBrand),
    validationCoreFunction(brandvalidSchemas.deleteBrand),
    asyncHandler(brandCont.deleteBrand)
)

router.delete(
    '/forceDeleteBrand',
    isAuth(brandAPIroles.forceDeleteBrands),
    validationCoreFunction(brandvalidSchemas.forceDeleteBrand),
    asyncHandler(brandCont.forceDeleteBrand)
)

export default router