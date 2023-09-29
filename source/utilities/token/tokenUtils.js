import jwt from 'jsonwebtoken'

// generate token method :
export const generateToken = ({
    payload = {},
    signature,
    expiresIn = '1d'
}) => {
    if (!Object.keys(payload).length) {
        return false
    }
    const token = jwt.sign(payload, signature, { expiresIn })
    return token
}

// verify : 
export const verifyToken = ({
    token = '',
    signature = process.env.DEFAULT_SECRET_KEY
}) => {
    if (!token) {
        return false
    }
    const checkToken = jwt.verify(token, signature)
    return checkToken
}