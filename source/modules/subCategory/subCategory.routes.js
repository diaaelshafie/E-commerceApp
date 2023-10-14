import {
    Router, subCatCont, subCatVSchemas, multerHostFunction, validationCoreFunction, allowedExtensions,
    asyncHandler, isAuth, subCategoryAPIroles
} from './subCategory.routes.imports.js'

const router = Router({ mergeParams: true })

router.post(
    '/createSubCategory/:categoryId',
    isAuth(subCategoryAPIroles.createSubCategory),
    multerHostFunction(allowedExtensions.image).single('subCategoryImage'),
    validationCoreFunction(subCatVSchemas.createSubCategorySchema),
    asyncHandler(subCatCont.createSubCategory)
)

router.put(
    '/updateSubCategory',
    isAuth(subCategoryAPIroles.updateSubCategory),
    multerHostFunction(allowedExtensions.image).single('subCategoryImage'),
    validationCoreFunction(subCatVSchemas.updateSubCategorySchema),
    asyncHandler(subCatCont.updateSubCategory)
)

router.delete(
    '/deleteSubCategory',
    isAuth(subCategoryAPIroles.deleteSubcategory),
    validationCoreFunction(subCatVSchemas.deleteSubCategorySchema),
    asyncHandler(subCatCont.deleteSubCategory)
)

router.delete(
    '/deleteSubCategoryWithBrands',
    isAuth(subCategoryAPIroles.forceDeleteSubCategory),
    validationCoreFunction(subCatVSchemas.deleteSubCategorySchema),
    asyncHandler(subCatCont.deleteSubCategoryWithBrands)
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
    '/test:categoryId',
    asyncHandler(subCatCont.test)
)

router.get(
    '/getAllSubCategories',
    isAuth(subCategoryAPIroles.getAllSubCategories),
    asyncHandler(subCatCont.getAllSubCategories)
)

export default router 