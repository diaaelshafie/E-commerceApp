import { userModel } from '../../DB/models/user.model.js'
import {
    categoryModel, subCategoryModel, slugify, cloudinary, customAlphabet,
    brandModel, paginationFunction
} from './subCategory.controller.imports.js'

const nanoid = customAlphabet('1gdsf3hlk2_-#po!', 6)

// create sub category :
export const createSubCategory = async (req, res, next) => {
    const { name } = req.body
    const createdBy = req.authUser._id
    // we need to get the categoryId to put it in the sub category data base .
    const { categoryId } = req.params
    console.log({
        createdBy,
        type: typeof (createdBy)
    })
    if (!req.file) {
        return next(new Error('please send a photo', { cause: 400 }))
    }
    if (!name) {
        return next(new Error('name is required!', { cause: 400 }))
    }
    if (await subCategoryModel.findOne({ name })) {
        return next(new Error('name already exists!', { cause: 400 }))
    }
    const category = await categoryModel.findById({ _id: categoryId })
    if (!category) {
        return next(new Error("category doesn't exist!", { cause: 400 }))
    }
    const sluggedName = slugify(name, '_')
    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
            folder: `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${category.customId}/subcategories/${customId}`
            // folder: `${process.env.PROJECT_UPLOADS_FOLDER}/subCategories/${customId}`
        }
    )
    // in case that the user uploaded a wrong file .
    if (!secure_url || !public_id) {
        await cloudinary.uploader.destroy(public_id)
        await cloudinary.api.delete_folder(`${process.env.PROJECT_UPLOADS_FOLDER}/categories/${category.customId}/subcategories/${customId}`)
        return next(new Error("couldn't upload the sub category image!", { cause: 400 }))
    }
    const saveSubCat = await subCategoryModel.create({
        name,
        image: {
            secure_url,
            public_id
        },
        slug: sluggedName,
        categoryId: category._id,
        customId: customId,
        createdBy
    })
    if (!saveSubCat) {
        return next(new Error("couldn't save sub category in data base!", { cause: 400 }))
    }
    res.json({
        message: "sub category added successfully !",
        subCategory: saveSubCat
    })
}

export const updateSubCategory = async (req, res, next) => {
    const { name } = req.body
    const { categoryId, _id } = req.query
    const createdBy = req.authUser._id
    let getSubCat
    if (req.authUser.role === 'Admin') {
        getSubCat = await subCategoryModel.findById(_id)
        if (!getSubCat) {
            return next(new Error('dear Admin , there is no such subCategory', { cause: 400 }))
        }
    } else { // the role is 'User'
        // make sure that the user trying to update is the same one who made this subCategory
        getSubCat = await subCategoryModel.findOne({ _id, createdBy })
        if (!getSubCat) {
            return next(new Error('dear User , there is no such subCategory', { cause: 400 }))
        }
    }
    // get the category related to the subCategory
    const getRelatedCategory = await categoryModel.findById(getSubCat.categoryId)
    if (!getRelatedCategory) {
        return next(new Error('the entered subCategory has no related category', { cause: 400 }))
    }
    if (name) {
        // the new name must not be the same as the old 
        if (name.toLowerCase() === getSubCat.name) {
            return next(new Error('the new name must be different from the old one!', { cause: 400 }))
        }
        // the new name entered must be unique
        const isNameUnique = await subCategoryModel.findOne({ name })
        if (isNameUnique) {
            return next(new Error('there is a sub category with that name', { cause: 400 }))
        }
        const slug = slugify(name, '_')
        getSubCat.name = name
        getSubCat.slug = slug
    }
    if (categoryId) {
        console.log('entered')
        // the new category Id must not be the same one as the old one
        if (categoryId == getSubCat.categoryId) { // == not === sice both are not of the same data type
            return next(new Error('please enter a different category id', { cause: 400 }))
        }
        console.log(categoryId === getSubCat.categoryId)
        // the new category Id must be an existing one 
        const isCategoryReal = await categoryModel.findOne({ _id: categoryId })
        if (!isCategoryReal) {
            return next(new Error('invalid category id', { cause: 400 }))
        }
        getSubCat.categoryId = categoryId
    }
    if (req.file) {
        // you must upload the new photo and delete the old one
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder:
                `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getRelatedCategory.customId}/subCategories/${getSubCat.customId}`
        })
        // we must delete the old subCategory photo from the cloudinary (it's still in the data base)
        await cloudinary.uploader.destroy(getSubCat.image?.public_id)
        getSubCat.image = {
            secure_url,
            public_id
        }
    }
    req.updateSubCatImgPath = `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getRelatedCategory.customId}/subCategories/${getSubCat.customId}`
    if (!await getSubCat.save()) {
        return next(new Error("couldn't update the sub category", { cause: 500 }))
    }
    res.status(200).json({
        message: "sub category updated!",
        subCategory: getSubCat
    })
}

export const deleteSubCategory = async (req, res, next) => {
    const { _id } = req.query
    const userId = req.authUser._id
    let messages = []
    // we need to either put the related brands to this sub cat to a general sub category or category or delete the sub category when it has no brands
    // in this API , we will delete the sub categ if it has no brands
    let getSubCat
    if (req.authUser.role === 'Admin') {
        getSubCat = await subCategoryModel.findById(_id)
        if (!getSubCat) {
            return next(new Error("didn't find such sub category!", { cause: 400 }))
        }
    }
    getSubCat = await subCategoryModel.findOne({
        createdBy: userId,
        _id
    })
    if (!getSubCat) {
        return next(new Error("didn't find such sub category!", { cause: 400 }))
    }
    const getRelatedCategory = await categoryModel.findById(getSubCat.categoryId)
    if (!getRelatedCategory) {
        return next(new Error("couldn't find the related category", { cause: 400 }))
    }
    const public_id = getSubCat.image.public_id
    const hasBrands = await brandModel.findOne({
        subCategoryId: _id
    })
    if (hasBrands) {
        return next(new Error("can't delete this sub category as it has brands!", { cause: 400 }))
    }
    // from here is the delete logic data base , cloudinary
    const deleteSubCategory = await subCategoryModel.findOneAndDelete({
        createdBy: userId,
        _id
    })
    if (!deleteSubCategory) {
        return next(new Error("couldn't delete the sub category from data base!", { cause: 400 }))
    }
    // you can't use cloudinary methods inside the if statement
    await cloudinary.uploader.destroy(public_id)
    await cloudinary.api.delete_folder(`${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getRelatedCategory.customId}/subCategories/${getSubCat.customId}`)
    req.deleteSubCatImgPath = `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getRelatedCategory.customId}/subCategories/${getSubCat.customId}`
    res.status(200).json({
        message: "sub category delete is done!",
        messages,
        deletedSubCat: deleteSubCategory
    })
}

// TODO : test in postman when you create some brands
export const deleteSubCategoryWithBrands = async (req, res, next) => {
    // this api will delete the sub category with it's related brands
    const { _id } = req.query
    const userId = req.authUser._id
    const getSubCategory = await subCategoryModel.findById(_id)
    if (!getSubCategory) {
        return next(new Error("didn't find such subCategory!", { cause: 400 }))
    }
    const getCategory = await categoryModel.findById(getSubCategory.categoryId)
    if (!getCategory) {
        return next(new Error("couldn't find the category!", { cause: 400 }))
    }
    const brands = await brandModel.find({ subCategoryId: getSubCategory._id })
    const deletedBrands = []
    const notDeletedBrandsIds = []
    const notDeletedLogos = []
    if (brands.length) {
        // deletion of brands will be in both cloudinary and data base
        for (const brand of brands) {
            // we need to store the public_id of the brand in a variable in case it got deleted
            await cloudinary.api.delete_resources(brandpublicId).catch((err) => {
                notDeletedLogos.push(brandpublicId)
            })
            await cloudinary.api.delete_folder(
                `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getRelatedCategory.customId}/subCategories/${getSubCat.customId}`
            )
            const brandpublicId = brand.logo.public_id
            if (!deletedBrands.push(await brandModel.deleteOne({ _id: brand._id }))) {
                notDeletedBrandsIds.push(brand._id)
            }
        }
    }
    const subCategoryPublicId = getSubCategory.image.public_id
    const deleteSubCategory = await subCategoryModel.findOneAndDelete({
        _id: getSubCategory._id
    })
    if (!deleteSubCategory) {
        return next(new Error("couldn't delete the sub category from data base!", { cause: 500 }))
    }
    if (!await cloudinary.uploader.destroy(subCategoryPublicId)) {
        return next(new Error("couldn't delete the sub category's image!", { cause: 500 }))
    }
    res.status(200).json({
        message: "deletion done!",
        deleteSubCategory,
        deletedBrands,
        vImp: "those below require manual deletion!",
        notDeletedBrandsIds,
        notDeletedLogos
    })
}

export const test = (req, res, next) => {
    res.json({
        message: "test!"
    })
}

// TODO : apply pagination
export const getAllSubCategories = async (req, res, next) => {
    const { page, size } = req.body
    const pagination = paginationFunction({ page, size })
    const subCategories = await subCategoryModel.find().populate([
        {
            path: 'categoryId',
            select: 'slug name',
        }, {
            path: 'createdBy',
            select: 'userName email'
        }
    ]).limit(pagination.limit).skip(pagination.skip)
    res.status(200).json({
        message: "done",
        subCategories
    })
}

// TODO : apply filtering on updating the sub category