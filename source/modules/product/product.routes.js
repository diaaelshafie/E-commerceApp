import {
    Router, productCont, asyncHandler, multerHostFunction, allowedExtensions,
    productValidSchemas, validationCoreFunction, checkNewProdcutData, isAuth,
    productAPIroles
} from './product.routes.imports.js'

const router = Router()

router.post(
    '/addProduct',
    isAuth(productAPIroles.addProduct),
    checkNewProdcutData(),
    multerHostFunction(allowedExtensions.image).array('images', 3),
    validationCoreFunction(productValidSchemas.addProductValidationSchema),
    asyncHandler(productCont.addProduct)
)

router.put(
    '/updateProduct',
    isAuth(productAPIroles.updateProducts),
    multerHostFunction(allowedExtensions.image).array('images', 3),
    validationCoreFunction(productValidSchemas.updateProductValidationSchema),
    asyncHandler(productCont.updateProduct)
)

router.get(
    '/getAllProducts',
    isAuth(productAPIroles.getAllProducts),
    asyncHandler(productCont.getAllProducts)
)

router.get(
    '/searchProductsByTitle',
    isAuth(productAPIroles.searchProductsByTitile),
    asyncHandler(productCont.searchProductsByTitle)
)

router.get(
    '/listProducts',
    isAuth(productAPIroles.listProducts),
    asyncHandler(productCont.listProducts)
)

router.get(
    '/filterProducts',
    isAuth(productAPIroles.filterProducts),
    asyncHandler(productCont.filterProducts)
)

router.get(
    '/apiFeatures',
    isAuth(productAPIroles.apiFeatures),
    asyncHandler(productCont.usingApiFeatures)
)

export default router 