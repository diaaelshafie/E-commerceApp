import {
    Router, multerHostFunction, allowedExtensions, asyncHandler,
    catValidSchemas, categoryCont, validationCoreFunction, subCategoryRouter,
    isAuth, categoryAPIroles
} from './category.routes.imports.js'

const router = Router()

// merge params : this is the parent router , we put a parameter here and tell this router to use `subCategoryRouter` APIs that have this parameter in common
router.use('/:categoryId', subCategoryRouter)

router.post(
    '/addCategory',
    isAuth(categoryAPIroles.ADDCATEGORY),
    multerHostFunction(allowedExtensions.image).single('categoryImage'),
    validationCoreFunction(catValidSchemas.addCategorySchema),
    asyncHandler(categoryCont.createCategory)
)

router.put(
    '/updateCategory:categoryId',
    isAuth(categoryAPIroles.UPDATECATEGORY),
    multerHostFunction(allowedExtensions.image).single('categoryImage'),
    validationCoreFunction(catValidSchemas.updateCategorySchema),
    asyncHandler(categoryCont.updateCategory)
)

router.get(
    '/getAllCategoriesWithTheirSubs',
    isAuth(categoryAPIroles.GETALLCATEGORIESWITHSUBS),
    asyncHandler(categoryCont.getAllCategoriesWithTheirSubs)
)

router.get(
    '/getAllCategoriesWithSubsWithVirtuals',
    isAuth(categoryAPIroles.GETALLCATEGORIESWITHSUBS),
    asyncHandler(categoryCont.getAllCategoriesWithSubsWithVirtuals)
)

router.delete(
    '/deleteCategory',
    isAuth(categoryAPIroles.DELETECATEGORY),
    asyncHandler(categoryCont.deleteCategory)
)

// router.post('/getAllCategoriesWithTheirSubs',
//     (req, res, next) => {

//     },
//     (req, res, next) => {

//     })

export default router