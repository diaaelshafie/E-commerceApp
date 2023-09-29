import { userModel } from "../../DB/models/user.model.js"

export const signUpChecks = () => {
    return async (req, res, next) => {
        const { userName, email, password, phoneNumber, address } = req.body
        if (!userName) {
            return next(new Error('you must enter a userName!', { cause: 400 }))
        }
        if (!email) {
            return next(new Error('you must enter an email!', { cause: 400 }))
        }
        if (!password) {
            return next(new Error('you must enter a password!', { cause: 400 }))
        }
        if (!phoneNumber) {
            return next(new Error('you must enter a phoneNumber!', { cause: 400 }))
        }
        if (!address) {
            return next(new Error('you must enter an address!', { cause: 400 }))
        }
        // if (await userModel.findOne({ email })) {
        //     return next(new Error('email already exists!', { cause: 400 }))
        // }
        next()
    }
}