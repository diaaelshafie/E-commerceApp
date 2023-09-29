import {
    cartModel, userModel, productModel
} from './cart.controller.imports.js'

export const addToCart = async (req, res, next) => {
    // this API adds a single product per request .
    const userId = req.authUser._id
    const { productId, quantity } = req.body
    // products Check and it's availability :
    const prodcutChecks = await productModel.findOne({
        _id: productId,
        stock: { $gte: quantity }
    })
    if (!prodcutChecks) {
        return next(new Error('invalid product please check the product or the quantity!', { cause: 400 }))
    }
    // userCart returns BSON , which needs to be changed
    const userCart = await cartModel.findOne({ userId }).lean()
    if (userCart) {
        let productExists = false
        for (const product of userCart.products) {
            if (productId == product.productId) {
                productExists = true
                product.quantity = quantity
            }
        }
        if (!productExists) {
            userCart.products.push({ productId, quantity })
        }
        let subTotal = 0
        for (const product of userCart.products) {
            const getProduct = await productModel.findById(product.productId)
            subTotal += (getProduct.priceAfterDiscount * product.quantity) || 0
        }
        const updatedCart = await cartModel.findOneAndUpdate({ userId }, {
            subTotal,
            products: userCart.products
        }, {
            new: true
        })
        return res.status(201).json({
            message: "done!",
            cart: updatedCart
        })
    }
    const cartObject = {
        userId,
        products: [{ productId, quantity }],
        subTotal: prodcutChecks.priceAfterDiscount * quantity
    }
    const saveCart = await cartModel.create(cartObject)
    res.status(201).json({
        message: "done!",
        cart: saveCart
    })
}

export const deleteFromCart = async (req, res, next) => {
    const userId = req.authUser._id
    const { productId } = req.body
    const prodcutChecks = await productModel.findOne({
        _id: productId
    })
    if (!prodcutChecks) {
        return next(new Error('invalid product id', { cause: 400 }))
    }
    const userCart = await cartModel.findOne({
        userId,
        // to access an array inside a mongoose query :
        'products.productId': productId
    })
    if (!userCart) {
        return next(new Error('user has no cart', { cause: 400 }))
    }
    userCart.products.forEach((ele) => {
        if (ele.productId == productId) {
            userCart.products.splice(userCart.products.indexOf(ele), 1)
        }
    })
    await userCart.save()
    res.status(200).json({
        message: "delete is done!",
        userCart
    })
}