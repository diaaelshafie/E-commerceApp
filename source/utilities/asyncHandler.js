import cloudinary from "../services/cloudinary.js"

export const asyncHandler = (API) => {
    return (req, res, next) => {
        // API is already async and it is a function
        API(req, res, next)
            .catch(async (err) => {
                console.log({
                    err: err,
                    message: err.message
                })
                console.log(req.imagePath)
                if (req.imagePath) {
                    await cloudinary.api.delete_resources_by_prefix(req.imagePath)
                    await cloudinary.api.delete_folder(req.imagePath)
                }
                return next(new Error('API failed to run !', { cause: 500 }))
            })
    }
}