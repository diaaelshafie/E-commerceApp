import mongoose from 'mongoose'

export const DBconnection = async () => {
    return await mongoose
        .connect(process.env.DB_CLOUD_IRL)
        .then((res) => console.log("DB connected successfully!"))
        .catch((err) => console.log("DB connection failed!"))
}