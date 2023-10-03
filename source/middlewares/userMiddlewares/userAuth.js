import { generateToken, verifyToken } from '../../utilities/token/tokenUtils.js'
import { userModel } from '../../DB/models/user.model.js'

// this contains authentication , authorization
// note : roles parameter should be an array since we use method .includes() => for arrays only
export const isAuth = (roles) => {
    return async (req, res, next) => {
        try {
            const { authorization } = req.headers
            if (!authorization) {
                return next(new Error('token is missing!', { cause: 400 }))
            }
            if (!authorization.split(' ')[0] == process.env.USER_LOGIN_TOKEN_PREFIX) {
                return next(new Error('invalid token prefix', { cause: 400 }))
            }
            const splittedToken = authorization.split(' ')[1]
            // another try , catch is made so the variable "splitted token" is seen in a catch scope bcs it wont be seen in the first catch scope
            try {
                // when a token expires , it doesn't get decoded
                const decodedToken = verifyToken({
                    token: splittedToken,
                    signature: process.env.LOGIN_SECRET_KEY
                })
                if (!decodedToken) {
                    return next(new Error('invalid token', { cause: 400 }))
                }
                if (!decodedToken._id) {
                    return next(new Error('critical token data is missing!', { cause: 400 }))
                }
                const getUser = await userModel.findOne({
                    _id: decodedToken._id,
                    email: decodedToken.email
                })
                if (!getUser) {
                    return next(new Error('user is not found!', { cause: 400 }))
                }
                if (!getUser.status === 'online') {
                    return next(new Error('user must be logged in!', { cause: 400 }))
                }
                if (!getUser.isConfirmed) {
                    return next(new Error('user must be confirmed!', { cause: 400 }))
                }
                if (!roles.includes(getUser.role)) {
                    return next(new Error('un Authorized to access this API', { cause: 401 }))
                }
                req.authUser = getUser
                next()
            } catch (error) {
                if (error == 'TokenExpiredError: jwt expired') {
                    const user = await userModel.findOne({
                        token: splittedToken
                    })
                    // if the token sent is wrong and expired :
                    if (!user) {
                        return next(new Error('invalid token', { cause: 400 }))
                    }
                    // generate a new token
                    const newToken = generateToken({
                        signature: process.env.LOGIN_SECRET_KEY,
                        expiresIn: '1d',
                        payload: {
                            email: user.email,
                            _id: user._id
                        }
                    })
                    user.token = newToken
                    user.save()
                    return res.status(200).json({
                        message: "token refreshed!",
                        newToken
                    })
                }
            }
        } catch (error) {
            console.log(error)
            return next(new Error('user authentication middleware error!', { cause: 500 }))
        }
    }
}