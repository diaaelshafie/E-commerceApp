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
                if (req.updateSubCatImgPath) {
                    await cloudinary.api.delete_resources_by_prefix(req.updateSubCatImgPath)
                }
                if (req.deleteSubCatImgPath) {
                    await cloudinary.api.delete_resources_by_prefix(req.deleteSubCatImgPath)
                    await cloudinary.api.delete_folder(req.deleteSubCatImgPath)
                }
                if (req.addBrandLogoPath) {
                    await cloudinary.api.delete_resources_by_prefix(req.addBrandLogoPath)
                    await cloudinary.api.delete_folder(req.addBrandLogoPath)
                }
                return next(new Error('API failed to run !', { cause: 500 }))
            })
    }
}