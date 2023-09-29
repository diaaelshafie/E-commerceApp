import { Schema, model } from "mongoose"
import bcrypt from 'bcrypt'
import { systemRoles } from "../../utilities/systemRoles.js"

const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: systemRoles.USER,
        enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPERADMIN]
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: [String],
        required: true
    },
    profilePicture: {
        secure_url: String,
        public_id: String
    },
    status: {
        type: String,
        default: 'offline',
        enum: ['offline', 'online']
    },
    gender: {
        type: String,
        default: 'notSpecified',
        enum: ['notSpecified', 'male', 'female']
    },
    age: Number,
    token: String,
    forgetCode: String,
    customId: String
}, {
    timestamps: true
})

// hooks methods are either : pre -> before , post -> after 
// V.IMP NOTE : if you intend to use the method of the hook more than once but not all the time , it's better not to use the hooks as they will apply to every time you will use that method specified

// pre must have 2 parameters (next,hash) , next is an important one , hash isn't
// userSchema.pre('save', function (next, hash) {
//     this.password = bcrypt.hashSync(this.password, +process.env.SIGN_UP_SALT_ROUNDS)
//     next()
// })

// post doesn't have any parameters

export const userModel = model('User', userSchema)