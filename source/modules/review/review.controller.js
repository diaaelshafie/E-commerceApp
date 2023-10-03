import {
    orderModel, reviewModel, productModel
} from './review.controller.imports.js'

export const addReview = async (req, res, next) => {
    const userId = req.authUser._id
    const { productId } = req.query
    const { review, reviewRate } = req.body
    const isProductBought = await orderModel.findOne({
        userId,
        'products.productId': productId,
        orderStatus: 'delivered'
    })
    if (!isProductBought) {
        return next(new Error("you didn't buy the product!", { cause: 400 }))
    }
    const saveReview = await reviewModel.create({
        userId,
        productId,
        review,
        reviewRate
    })
    if (!saveReview) {
        return next(new Error("failed to save Review!", { cause: 500 }))
    }
    // we need to update the total rate of the product each time we add a review for it
    const getProduct = await productModel.findById(productId)
    const getReviews = await reviewModel.find({
        productId // this query will return an array
    })
    let sumOfRates = 0
    for (const review of getReviews) {
        sumOfRates += review.reviewRate
    }
    // we need to take only two digits after the decimal
    getProduct.rates = Number(sumOfRates / getReviews.length).toFixed(3)
    await getProduct.save()
    res.status(201).json({
        message: "review is saved!",
        review: saveReview,
        product: getProduct
    })
}