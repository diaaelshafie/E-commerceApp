import {
    Router, subCatCont, subCatVSchemas, multerHostFunction, validationCoreFunction, allowedExtensions,
    asyncHandler, isAuth, subCategoryAPIroles
} from './subCategory.routes.imports.js'

const router = Router({ mergeParams: true })

router.post(
    '/createSubCategory:categoryId',
    isAuth(subCategoryAPIroles.createSubCategory),
    multerHostFunction(allowedExtensions.image).single('subCategoryImage'),
    validationCoreFunction(subCatVSchemas.createSubCategorySchema),
    asyncHandler(subCatCont.createSubCategory)
)

router.post(
    '/test',
    asyncHandler(subCatCont.test)
)

router.post(
    '/test:categoryId',
    asyncHandler(subCatCont.test)
)

router.get(
    '/getAllSubCategories',
    isAuth(subCategoryAPIroles.getAllSubCategories),
    asyncHandler(subCatCont.getAllSubCategories)
)

export default router