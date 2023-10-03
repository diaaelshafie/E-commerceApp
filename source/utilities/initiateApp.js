// here we will put all the routers and the middlewares and then import them to the index.js file
import { DBconnection } from "../DB/connection.js"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { GeneralResponse } from "./generalResponse.js"
import * as Routers from '../modules/index.routes.js'
import { changeCouponStatus } from "./crons.js"
import cors from 'cors'

export const initiateApp = (app, express) => {
    const port = process.env.PORT || 5000
    DBconnection() // mongo DB
    // sql DB connection 

    // for parsing :
    app.use(express.json())
    app.use(cors()) // allows any one to connect to the APIs

    app.use('/category', Routers.categoryRouter)
    app.use('/subCategory', Routers.subCategoryRouter)
    app.use('/brand', Routers.brandRouter)
    app.use('/product', Routers.productRouter)
    app.use('/coupon', Routers.couponrouter)
    app.use('/auth', Routers.authRouter)
    app.use('/user', Routers.userRouter)
    app.use('/cart', Routers.cartRouter)
    app.use('/order', Routers.orderRouter)
    app.use('/review', Routers.reviewRouter)

    app.use('*', (req, res, next) => {
        res.status(StatusCodes.NOT_FOUND).json({
            message: "error 404 , url is not found",
            reason: ReasonPhrases.NOT_FOUND
        })
    })

    app.use(GeneralResponse)
    changeCouponStatus()
    app.listen(port, () => {
        console.log("server is running successfully")
    })
}