import {
    Router, asyncHandler, isAuth, reviewCont, ReviewAPIroles, reviewSchemas, validationCoreFunction
} from './review.route.imports.js'

const router = Router()

router.post(
    '/addReview',
    isAuth(ReviewAPIroles.addReview),
    asyncHandler(reviewCont.addReview)
)

export default router