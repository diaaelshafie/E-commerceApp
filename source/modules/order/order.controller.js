import {
    orderModel, couponModel, isCouponValid, productModel, cartModel, createInvoice,
    mailFunction, customAlphabet, qrCodeFunction, stripePayment, generateToken, verifyToken,
    stripe
} from './order.controller.imports.js'
const nanoid = customAlphabet('12gds3fh@', 4)

export const createOrder = async (req, res, next) => {
    // this adds a single product to the order .
    const userId = req.authUser._id
    const { productId, quantity, address, phone, paymentMethod, couponCode } = req.body

    // coupon checks :
    if (couponCode) {
        const coupon = await couponModel.findOne({ couponCode })
            .select(process.env.order_select_coupon_data)
        // we need to use "await" here
        const isCouponValidated = await isCouponValid({ couponCode, userId, next })
        // we need to do this to close the API not the function scope only
        if (isCouponValidated !== true) {
            return isCouponValidated
        }
        req.coupon = coupon
    }

    // products checks :
    const products = []
    const getProduct = await productModel.findOne({
        _id: productId,
        stock: { $gte: quantity }
    })
    if (!getProduct) {
        return next(new Error("couldn't find the product!", { cause: 400 }))
    }
    const productObject = {
        productId,
        quantity,
        title: getProduct.title,
        price: getProduct.priceAfterDiscount,
        finalPrice: getProduct.priceAfterDiscount * quantity
    }
    products.push(productObject)

    let subTotal = productObject.finalPrice
    let paidAmount = 0
    // req.coupon is returned from the function "isCouponValid"
    if (req.coupon?.isPercentage) {
        paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
    }
    else if (req.coupon?.isFixed) {
        paidAmount = subTotal - req.coupon.couponAmount
    }
    else {
        paidAmount = subTotal
    }

    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

    const orderObject = {
        userId,
        products,
        address,
        phone,
        orderStatus,
        paymentMethod,
        subTotal,
        paidAmount,
        couponId: req.coupon?._id
    }
    const saveOrder = await orderModel.create(orderObject)
    if (saveOrder) {
        // payment :
        let orderSession
        if (saveOrder.paymentMethod == 'card') {
            // to generate a coupon from stripe :
            if (req.coupon) {
                const STRIPE = new stripe(process.env.stripe_secret_key)
                let coupon
                // coupon -> percentage :
                if (req.coupon.isPercentage) {
                    coupon = await STRIPE.coupons.create({
                        percent_off: req.coupon.couponAmount
                    })
                }
                // coupon -> fixed amount :
                if (req.coupon.isFixed) {
                    coupon = await STRIPE.coupons.create({
                        amount_off: req.coupon.couponAmount * 100,
                        currency: 'EGP'
                    })
                }
                req.couponId = coupon.id
            }
            const token = await generateToken({
                payload: { orderId: saveOrder._id },
                signature: process.env.order_secretKey,
                expiresIn: '1h'
            })
            orderSession = await stripePayment({
                payment_method_types: ['card'],
                mode: 'payment',
                customer_email: req.authUser.email,
                metadata: {
                    orderId: saveOrder._id.toString()
                },
                success_url: `${req.protocol}://${req.headers.host}/order/successOrder?token=${token}`,
                cancel_url: `${req.protocol}://${req.headers.host}/order/cancelOrder?token=${token}`,
                line_items: saveOrder.products.map((ele) => {
                    return {
                        price_data: {
                            currency: 'EGP',
                            product_data: {
                                name: ele.title
                            },
                            unit_amount: ele.price * 100
                        },
                        quantity: ele.quantity
                    }
                }),
                discounts: req.coupon ? [{ coupon: req.couponId }] : []
            })
        }

        // increase coupon usage count for the user
        if (req.coupon) {
            for (const user of req.coupon?.couponAssignedToUsers) {
                if (user.userId.toString() == userId.toString()) {
                    user.usageCount += 1
                }
            }
            await req.coupon.save()
        }
        // decrease the product stock by the product quantity 
        await productModel.findOneAndUpdate({ _id: productId }, {
            $inc: { stock: -parseInt(quantity) }
        }, { new: true })
        // remove the product from the cart of the user if it exists

        // create qrCode : 
        const orderQrCode = await qrCodeFunction({ data: { orderId: saveOrder._id, products: saveOrder.products, subTotal: saveOrder.subTotal } })

        const orderCode = `${req.authUser.userName}_${nanoid()}`
        // create invoice object data :
        const orderInvoice = {
            shipping: {
                name: req.authUser.userName,
                address: saveOrder.address,
                city: 'Suez',
                state: 'Suez',
                country: 'Egypt'
            },
            orderCode,
            date: saveOrder.createdAt,
            items: saveOrder.products,
            subTotal: saveOrder.subTotal,
            paidAmount: saveOrder.paidAmount
        }
        await createInvoice(orderInvoice, `${orderCode}.pdf`)
        await mailFunction({
            to: req.authUser.email,
            subject: 'Order',
            message: '<h1> this is your order invoice </h1>',
            attachements: [
                {
                    path: `../../files/${orderCode}.pdf`
                }
            ]
        })
        return res.status(201).json({
            message: "order created!",
            order: saveOrder,
            orderQrCode,
            chechOutPage: orderSession
        })
    }
    return next(new Error('failed to create order'), { cause: 400 })
}

export const convertCartToOrder = async (req, res, next) => {
    const userId = req.authUser._id
    const { cartId } = req.query
    const { address, phone, paymentMethod, couponCode } = req.body

    const getCart = await cartModel.findById(cartId)
    if (!getCart || !getCart.products.length) {
        return next(new Error('please fille your cart first!', { cause: 400 }))
    }

    if (couponCode) {
        const coupon = await couponModel.findOne({ couponCode })
            .select(process.env.order_select_coupon_data)
        // we need to use "await" here
        const isCouponValidated = await isCouponValid({ couponCode, userId, next })
        // we need to do this to close the API not the function scope only
        if (isCouponValidated !== true) {
            return isCouponValidated
        }
        req.coupon = coupon
    }

    let subTotal = getCart.subTotal
    let paidAmount = 0
    if (req.coupon?.isPercentage) {
        paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100)
    }
    else if (req.coupon?.isFixed) {
        paidAmount = subTotal - req.coupon.couponAmount
    }
    else {
        paidAmount = subTotal
    }

    let orderStatus
    paymentMethod == 'cash' ? (orderStatus = 'placed') : (orderStatus = 'pending')

    let products = []
    for (const product of getCart.products) {
        const isProductExists = await productModel.findById(product.productId)
        products.push({
            productId: product.productId,
            quantity: product.quantity,
            title: isProductExists.title,
            price: isProductExists.priceAfterDiscount,
            finalPrice: isProductExists.priceAfterDiscount * product.quantity
        })
    }

    const orderObject = {
        userId,
        products,
        address,
        phone,
        orderStatus,
        paymentMethod,
        subTotal,
        paidAmount,
        couponId: req.coupon?._id
    }
    const saveOrder = await orderModel.create(orderObject)
    if (saveOrder) {
        if (req.coupon) {
            for (const user of req.coupon?.couponAssignedToUsers) {
                if (user.userId.toString() == userId.toString()) {
                    user.usageCount += 1
                }
            }
            await req.coupon.save()
        }
        for (const product of getCart.products) {
            await productModel.findOneAndUpdate({ _id: product.productId }, {
                $inc: { stock: -parseInt(product.quantity) }
            }, { new: true })
        }
        // remove the cart if exists !
        getCart.products = []
        await getCart.save()

        return res.status(201).json({
            message: "order created!",
            order: saveOrder
        })
    }
    return next(new Error('failed to create order'), { cause: 400 })
}

export const successPayment = async (req, res, next) => {
    const { token } = req.query
    const decodedToken = verifyToken({
        token,
        signature: process.env.order_secretKey
    })
    const getOrder = await orderModel.findOne({
        _id: decodedToken.orderid,
        orderStatus: 'pending'
    })
    if (!getOrder) {
        return next(new Error('failed to get the order,wrong order id'), { cause: 400 })
    }
    getOrder.orderStatus = 'confirmed'
    await getOrder.save()
    res.status(200).json({
        message: "your order is now confirmed!",
        order: getOrder
    })
}

export const cancelPayment = async (req, res, next) => {
    const { token } = req.query
    const decodedToken = verifyToken({
        token,
        signature: process.env.order_secretKey
    })
    const getOrder = await orderModel.findOne({
        _id: decodedToken.orderid
    })
    if (!getOrder) {
        return next(new Error('failed to get the order,wrong order id'), { cause: 400 })
    }
    // approach 1: order status = 'cancelled'
    getOrder.orderStatus = 'cancelled'
    await getOrder.save()

    // approach 2: delete the order from the database
    // await orderModel.findByIdAndDelete(decodedToken.orderId)

    // undo products stock + coupon usage :
    for (const product of getOrder.products) {
        await productModel.findByIdAndUpdate(product.productId, {
            $inc: { stock: parseInt(product.quantity) }
        })
    }

    if (order.couponId) {
        const coupon = await couponModel.findById(order.couponId)
        if (!coupon) {
            return next(new Error("this coupon doesn't exist!", { cause: 400 }))
        }
        coupon.couponAssignedToUsers.map((ele) => {
            if (ele.userId.toString() == order.userId.toString()) {
                ele.usageCount -= 1
            }
        })
        await coupon.save()
    }
    res.status(200).json({
        message: "your order is cancelled!",
        cancelledOrder: getOrder
    })
}