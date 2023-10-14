import {
    categoryModel, subCategoryModel, brandModel, cloudinary, slugify, customAlphabet, checkNewBrandData
} from './brand.controller.imports.js'

const nanoid = customAlphabet('1gdsf3hlk2_-#po!', 6)

// add brand
export const addBrand = async (req, res, next) => {
    const { name } = req.body
    const { categoryId, subCategoryId } = req.query
    const createdBy = req.authUser._id
    const sluggedName = slugify(name, '_')
    const getCategory = await categoryModel.findById(categoryId)
    if (!getCategory) {
        return next(new Error("invalid category Id", { cause: 400 }))
    }
    const getSubCategory = await subCategoryModel.findById(subCategoryId)
    if (!getSubCategory) {
        return next(new Error("invalid sub category Id", { cause: 400 }))
    }
    // we need to check if the category , sub category entered are related
    const checkCatSubCatRelated = await subCategoryModel.findOne({
        _id: subCategoryId,
        categoryId
    })
    if (!checkCatSubCatRelated) {
        return next(new Error("the enetered category and sub category aren't related!", { cause: 400 }))
    }
    console.log('flag1')
    // we need to make a customId to store it in the data base as the media host logo file name
    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${customId}`
    })
    req.addBrandLogoPath = `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${customId}`
    if (!secure_url || !public_id) {
        // preferred to make the cloudinary upload to be stored in a file to log it's Errors here 
        // console.log(uploadedLogo.error)
        return next(new Error("couldn't upload the logo on the media host", { cause: 400 }))
    }
    console.log({
        createdBy,
        type: typeof (createdBy)
    })
    const saveBrand = await brandModel.create({
        name,
        slug: sluggedName,
        categoryId,
        createdBy,
        customId,
        logo: {
            secure_url,
            public_id
        },
        subCategoryId
    })
    if (!saveBrand) {
        await cloudinary.uploader.destroy(public_id)
        await cloudinary.api.delete_folder(req.addBrandLogoPath)
        return next(new Error("failed to store the brand in the data base", { cause: 400 }))
    }
    res.status(200).json({
        message: "brand adding is successfull!",
        brand: saveBrand
    })
}