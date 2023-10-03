import {
    bcrypt, cloudinary, customAlphabet, userModel, mailFunction, generateToken, verifyToken, OAuth2Client
} from '../user/user.controller.imports.js'

const nanoid = customAlphabet('agd3jklv1487_-$', 5)

export const signUp = async (req, res, next) => {
    const {
        userName, email, password, phoneNumber, address, gender, age
    } = req.body
    console.log(req.file)
    if (await userModel.findOne({ email })) {
        return next(new Error('email already exists!', { cause: 400 }))
    }
    const customId = nanoid()
    let image
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.PROJECT_UPLOADS_FOLDER}/Users/${customId}/profilePicture`
        })
        if (!secure_url || !public_id) {
            return next(new Error("couldn't save the image!", { cause: 400 }))
        }
        image = { secure_url, public_id }
    }
    req.imagePath = `${process.env.PROJECT_UPLOADS_FOLDER}/Users/${customId}/profilePicture`

    const hashedPassword = bcrypt.hashSync(password, +process.env.SIGN_UP_SALT_ROUNDS)

    const userData = {
        userName, email, password: hashedPassword,
        phoneNumber, address, gender, age,
        customId,
        profilePicture: image
    }

    const saveUser = await userModel.create(userData)
    if (!saveUser) {
        await cloudinary.uploader.destroy(image.public_id)
        return next(new Error("couldn't save the user in the data base !", { cause: 400 }))
    }

    const confirmToken = generateToken({ payload: { email }, signature: process.env.CONFIRM_LINK_SECRETE_KEY, expiresIn: '1h' })
    // `${req.protocol}://${req.headers.host}:${process.env.PORT}/user/confirmEmail/${EmailConfirmToken}`
    const confirmLink = `${req.protocol}://${req.headers.host}/auth/confirmAccount${confirmToken}`
    const message = `<a href = ${confirmLink} >PLEASE USE THIS LINK TO CONFIRM YOUR EMAIL !</a>`
    const subject = 'Email confirmation'
    const sendEMail = mailFunction({ message, to: email, subject })
    if (!sendEMail) {
        return next(new Error('sending email failed!', { cause: 500 }))
    }

    res.status(200).json({
        message: "user added!",
        user: saveUser
    })
}

export const confirmAccount = async (req, res, next) => {
    const { confirmToken } = req.params
    const decodeToken = verifyToken({ token: confirmToken, signature: process.env.CONFIRM_LINK_SECRETE_KEY })
    if (!decodeToken) {
        return next(new Error('failed to decode the token!', { cause: 400 }))
    }
    const getUser = await userModel.findOneAndUpdate({ email: decodeToken?.email, isConfirmed: false }, { isConfirmed: true }, { new: true })
    if (!getUser) {
        return next(new Error('failed to confirm user!', { cause: 400 }))
    }
    res.status(200).json({
        message: "confirmation done!",
        user: getUser
    })
}

export const logIn = async (req, res, next) => {
    const { email, password } = req.body
    // const getUser = await userModel.findOne({ email: email })
    const getUser = await userModel.findOne({ email })
    if (!getUser) {
        console.log('email error')
        return next(new Error('invalid login credentials', { cause: 400 }))
    }
    console.log('User found:', getUser)
    const isPassMatch = bcrypt.compareSync(password, getUser.password)
    console.log({
        password,
        hashedPassword: isPassMatch
    })
    if (!isPassMatch) {
        console.log('pass error')
        return next(new Error('invalid login credentials', { cause: 400 }))
    }

    const token = generateToken({
        payload: {
            email,
            _id: getUser._id,
            role: getUser.role
        },
        signature: process.env.LOGIN_SECRET_KEY,
        expiresIn: '1d'
    })
    if (!token) {
        return next(new Error('failed to generate user token', { cause: 500 }))
    }

    const updateUser = await userModel.findOneAndUpdate({ email }, { status: 'online', token }, { new: true })
    if (!updateUser) {
        return next(new Error('failed to login the user!', { cause: 500 }))
    }

    res.status(200).json({
        message: "login is successfull!",
        user: updateUser
    })
}

// related to another API : reset password
export const forgetPassword = async (req, res, next) => {
    // TODO : make this API takes the password from the user instead and the email from the token that the front end will send it you
    const { email } = req.body
    const getUser = await userModel.findOne({ email })
    if (!getUser) {
        return next(new Error('wrong email', { cause: 400 }))
    }
    const code = nanoid()
    const hashedCode = bcrypt.hashSync(code, +process.env.FORGET_PASSWORD_CODE_SALT)
    const token = generateToken({
        payload: {
            email,
            resetCode: hashedCode
        },
        signature: process.env.reset_password_secret_key,
        expiresIn: '1h'
    })
    const resetPassLink = `${req.protocol}://${req.headers.host}/auth/resetPassword${token}`
    const resetEmail = mailFunction({
        to: email,
        subject: 'Reset password',
        message: `<a href = ${resetPassLink} >PLEASE USE THIS LINK TO RESET YOUR PASSWORD !</a>`
    })
    if (!resetEmail) {
        return next(new Error('failed to reset the password', { cause: 400 }))
    }
    const updateUser = await userModel.findOneAndUpdate({ email }, { forgetCode: hashedCode }, { new: true })
    if (!updateUser) {
        return next(new Error('failed to update password status in data base!', { cause: 400 }))
    }
    res.status(200).json({
        message: "forget password done!",
        user: updateUser
    })
}

export const resetPassword = async (req, res, next) => {
    const { token } = req.params
    const { newPassword } = req.body
    const decodedToken = verifyToken({
        token,
        signature: process.env.reset_password_secret_key
    })
    if (!decodedToken) {
        return next(new Error('failed to decode the token', { cause: 400 }))
    }
    const getUser = await userModel.findOne({
        email: decodedToken.email,
        forgetCode: decodedToken.resetCode
    })
    if (!getUser) {
        return next(new Error('failed to find user', { cause: 400 }))
    }
    if (bcrypt.compare(newPassword, getUser.password)) {
        return next(new Error('enter a different password', { cause: 400 }))
    }
    const hashedNewPassword = bcrypt.hashSync(newPassword, +process.env.reset_password_salt)
    getUser.password = hashedNewPassword
    getUser.forgetCode = null
    if (!await getUser.save()) {
        return next(new Error('failed to reset password in data base', { cause: 400 }))
    }
    res.status(200).json({
        message: "reset password done!",
        user: getUser
    })
}

export const loginWithGoogle = async (req, res, next) => {
    const client = new OAuth2Client()
    const { idToken } = req.body
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.social_login_clientId,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        return payload
    }
    const { email_verified, email, name } = await verify()
    if (!email_verified) {
        return next(new Error('invalid email!', { cause: 400 }))
    }
    // if true : either login or sign up
    const getUser = await userModel.findOne({
        email,
        provider: 'Google'
    })
    // login :
    if (getUser) {
        const token = generateToken({
            payload: {
                email,
                _id: getUser._id,
                role: getUser.role
            },
            signature: process.env.LOGIN_SECRET_KEY,
            expiresIn: '1d'
        })
        if (!token) {
            return next(new Error('failed to generate user token', { cause: 500 }))
        }

        const updateUser = await userModel.findOneAndUpdate({ email }, { status: 'online', token }, { new: true })
        if (!updateUser) {
            return next(new Error('failed to login the user!', { cause: 500 }))
        }

        return res.status(200).json({
            message: "login is successfull!",
            user: updateUser,
            token
        })
    }

    // sign Up :
    const userObject = {
        userName: name,
        password: nanoid(3),
        provider: 'Google',
        isConfirmed: true,
        phoneNumber: '',
        Role: 'User',
    }
    const saveUser = await userModel.create(userObject)
    if (!saveUser) {
        return next(new Error('failed to save the user!', { cause: 500 }))
    }
    const token = generateToken({
        payload: {
            email: saveUser.email,
            _id: saveUser._id,
            role: saveUser.role
        },
        signature: process.env.LOGIN_SECRET_KEY,
        expiresIn: '1d'
    })
    saveUser.token = token
    saveUser.status = 'online'
    await saveUser.save()
    res.status(200).json({
        message: "verified",
        user: saveUser
    })
}
