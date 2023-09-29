import {
    categoryModel, subCategoryModel, brandModel, cloudinary, slugify, customAlphabet
} from './brand.controller.imports.js'

const nanoid = customAlphabet('1gdsf3hlk2_-#po!', 6)

// add brand 
export const addBrand = async (req, res, next) => {
    const { name } = req.body
    const { categoryId, subCategoryId } = req.query
    const sluggedName = slugify(name, '_')
    const getCategory = await categoryModel.findById({ _id: categoryId })
    const getSubCategory = await subCategoryModel.findById({ _id: subCategoryId })
    if (!getCategory || !getSubCategory) {
        return next(new Error("a category or sub category you entered doesn't exists", { cause: 400 }))
    }
    // we need to check if the category , sub category entered are related
    const checkCatSubCatRelated = await subCategoryModel.findOne({
        _id: subCategoryId,
        categoryId
    })
    if (!checkCatSubCatRelated) {
        return next(new Error("the enetered category and sub category aren't related!", { cause: 400 }))
    }
    // we need to make a customId to store it will the data base as the media host logo file name
    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${customId}`
    })
    if (!secure_url || !public_id) {
        // preferred to make the cloudinary upload to be stored in a file to log it's Errors here 
        // console.log(uploadedLogo.error)
        return next(new Error("couldn't upload the logo on the media host", { cause: 400 }))
    }
    const saveBrand = await brandModel.create({
        name,
        slug: sluggedName,
        customId,
        logo: {
            secure_url,
            public_id
        },
        // TODO : add createdBy when the user is made
        subCategoryId,
        categoryId,
    })
    if (!saveBrand) {
        await cloudinary.uploader.destroy(public_id)
        return next(new Error("failed to store the brand in the data base", { cause: 400 }))
    }
    res.status(200).json({
        message: "brand adding is successfull!",
        brand: saveBrand
    })
}