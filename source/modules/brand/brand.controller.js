import { userModel } from '../../DB/models/user.model.js'
import {
    categoryModel, subCategoryModel, brandModel, cloudinary, slugify, customAlphabet, checkNewBrandData,
    paginationFunction, productModel
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
        folder: `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${customId}`,
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

export const updateBrand = async (req, res, next) => {
    const { name } = req.body
    const createdBy = req.authUser._id
    // newAdmin -> new createdBy
    const { _id, newAdmin, categoryId, subCategoryId } = req.query
    let updated = false
    const getbrand = await brandModel.findOne({
        _id,
        createdBy
    })
    if (!getbrand) {
        return next(new Error('invalid Admin Id', { cause: 400 }))
    }
    const getCategory = await categoryModel.findById(getbrand.categoryId)
    if (!getCategory) {
        return next(new Error("category doesn't exist!", { cause: 400 }))
    }
    // check category , sub are related and get the sub category :
    const getSubCategory = await subCategoryModel.findOne({
        _id: getbrand.subCategoryId,
        categoryId: getCategory._id
    })
    if (!getSubCategory) {
        return next(new Error("invalid sub category Id!", { cause: 400 }))
    }
    let slug
    if (name) {
        if (name.toLowerCase() === getbrand.name.toLowerCase()) {
            return next(new Error("you must enter a different name than the old one!", { cause: 400 }))
        }
        slug = slugify(name, '_')
        getbrand.slug = slug
        getbrand.name = name
        updated = true
    }
    if (newAdmin) {
        const getAdmin = await userModel.findOne({
            _id: newAdmin,
            role: 'Admin'
        })
        if (!getAdmin) {
            return next(new Error("admin doesn't exist or the user isn't an admin!", { cause: 400 }))
        }
        getbrand.createdBy = getAdmin._id
        updated = true
    }
    // if it's wanted to change only the sub category
    if (subCategoryId && !categoryId) {
        const getNewSubCategory = await subCategoryModel.findOne({
            _id: subCategoryId,
            categoryId: getCategory._id
        })
        if (!getNewSubCategory) {
            return next(new Error("new sub category isn't related to current category", { cause: 400 }))
        }
        getbrand.subCategoryId = getNewSubCategory._id
        updated = true
    }
    // if both categ , sub categ will change
    if (subCategoryId && categoryId) {
        const getNewCategory = await categoryModel.findById(categoryId)
        if (!getNewCategory) {
            return next(new Error("new category not found!", { cause: 400 }))
        }
        const getNewSubCategory = await subCategoryModel.findOne({
            _id: subCategoryId,
            categoryId: categoryId
        })
        if (!getNewSubCategory) {
            return next(new Error("new sub category , category aren't related!", { cause: 400 }))
        }
        getbrand.categoryId = getNewCategory._id
        getbrand.subCategoryId = getNewSubCategory._id
        updated = true
    }
    // if only categ will change -> unacceptable
    if (categoryId && !subCategoryId) {
        return next(new Error("unacceptable", { cause: 406 }))
    }
    let customId
    if (req.file) {
        customId = nanoid()
        // delete the old logo and put the new one
        // the catch must be here so the first 2 awaits are ignored if the folder on cloudinary doesn't exist !
        await cloudinary.api.delete_all_resources({
            public_ids: [getbrand.customId]
        }).catch((err) => { })
        await cloudinary.api.delete_folder(
            `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getbrand.customId}`
        ).catch((err) => { })
        // to put the new logo
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${customId}`
        })
        getbrand.logo.public_id = public_id
        getbrand.logo.secure_url = secure_url
        getbrand.customId = customId
        updated = true
    }
    if (updated == true) { getbrand.__v++ }
    if (!await getbrand.save()) {
        return next(new Error("couldn't save updates in data base", { cause: 400 }))
    }
    res.status(200).json({
        message: "update is done",
        updatedBrand: getbrand
    })
}

export const getAllBrands = async (req, res, next) => {
    const { _id } = req.authUser // _id of the user (admin)
    // const { yourBrands } = req.body // boolean if the admin wants his brands only or all the brands
    const { page, size } = req.query
    let getAllBrands, createdByYou
    const pagination = paginationFunction({ page, size })
    if (req.authUser.role === 'Admin') {
        // if the user is an admin -> automatically get all the brands he created only
        getAllBrands = await brandModel.find({
            createdBy: _id
        }).limit(pagination.limit).skip(pagination.skip)
        if (!getAllBrands) {
            return next(new Error("there was an error getting the brands", { cause: 500 }))
        }
        createdByYou = true
    }
    else if (req.authUser.role == 'superAdmin') {
        // if the user is a super admin , then he gets all the brands created generally
        getAllBrands = await brandModel.find().limit(pagination.limit).skip(pagination.skip)
        if (!getAllBrands) {
            return next(new Error("couldn't get all the brands", { cause: 500 }))
        }
    }
    res.status(200).json({
        message: "brands fetching done!",
        brands: getAllBrands,
        createdByYou: createdByYou
    })
}

export const deleteBrand = async (req, res, next) => {
    const { _id } = req.query
    const createdBy = req.authUser._id
    const getBrand = await brandModel.findOne({
        _id,
        createdBy
    })
    if (!getBrand) {
        return next(new Error("couldn't find the brand!", { cause: 400 }))
    }
    const getCategory = await categoryModel.findById(getBrand.categoryId)
    if (!getCategory) { return next(new Error("category isn't found , check if it's deleted or changed!", { cause: 400 })) }
    const getSubCategory = await subCategoryModel.findOne({
        _id: getBrand.subCategoryId,
        categoryId: getCategory._id
    })
    if (!getSubCategory) { return next(new Error("subCategory isn't found , check if it's deleted or changed!", { cause: 400 })) }
    const { public_id } = getBrand?.logo
    // if the brand has products , we won't delete the brand itself
    const getProducts = await productModel.find({
        brandId: _id
    })
    // if there are products found :
    if (getProducts.length) {
        return next(new Error("can't delete the brand as it has related products", { cause: 400 }))
    }
    // we need to delete both the logo and the brand itself
    await cloudinary.uploader.destroy(public_id)
    // .catch((error) => {
    //     if (error.message.includes("Can't find folder with path E-commerce App")) {
    //     }
    //     console.log(error)
    // })
    await cloudinary.api.delete_folder(
        `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getBrand.customId}`
    )
    req.brandLogoPath = `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getBrand.customId}`
    const deleteBrand = await brandModel.findOneAndDelete({
        _id: getBrand._id
    })
    if (!deleteBrand) {
        return next(new Error("couldn't delete the brand!", { cause: 500 }))
    }
    res.status(200).json({
        message: "empty brand deleted !",
        deletedBrand: deleteBrand
    })
}

export const forceDeleteBrand = async (req, res, next) => {
    const { _id } = req.query
    const createdBy = req.authUser._id
    const getBrand = await brandModel.findOne({
        _id,
        createdBy
    })
    if (!getBrand) {
        return next(new Error("couldn't find the brand!", { cause: 400 }))
    }
    const getCategory = await categoryModel.findById(getBrand.categoryId)
    if (!getCategory) { return next(new Error("category isn't found , check if it's deleted or changed!", { cause: 400 })) }
    const getSubCategory = await subCategoryModel.findOne({
        _id: getBrand.subCategoryId,
        categoryId: getCategory._id
    })
    if (!getSubCategory) { return next(new Error("subCategory isn't found , check if it's deleted or changed!", { cause: 400 })) }
    const { public_id } = getBrand?.logo
    // if the brand has products , we will delete them first
    const getProducts = await productModel.find({
        brandId: _id
    })
    // if there are products found :
    let undeletedProductIds = []
    if (getProducts.length) {
        let productsPublicIds = []
        for (const product of getProducts) {
            for (const image of product.images) {
                productsPublicIds.push(image.public_id)
            }
            await cloudinary.api.delete_resources(productsPublicIds)
            await cloudinary.api.delete_folder(
                `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getBrand.customId}/products/${product.customId}`
            )
            productsPublicIds = [] // the public_ids array is emptied again
            await productModel.findOneAndDelete({
                _id: product._id
            }).catch((error) => { undeletedProductIds.push(product._id); console.log(error); })
        }
    }
    await cloudinary.uploader.destroy(public_id)
    await cloudinary.api.delete_folder(
        `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getBrand.customId}`
    )
    req.brandLogoPath = `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getBrand.customId}`
    const deleteBrand = await brandModel.findOneAndDelete({
        _id: getBrand._id
    })
    if (!deleteBrand) {
        return next(new Error("couldn't delete the brand!", { cause: 500 }))
    }
    res.status(200).json({
        message: "empty brand deleted !",
        deletedBrand: deleteBrand,
        undeletedProductIds
    })
}