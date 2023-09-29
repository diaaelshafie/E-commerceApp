import {
    categoryModel, subCategoryModel, slugify, cloudinary, customAlphabet
} from './subCategory.controller.imports.js'

const nanoid = customAlphabet('1gdsf3hlk2_-#po!', 6)

// create sub category :
export const createSubCategory = async (req, res, next) => {
    const { name } = req.body
    // we need to get the categoryId to put it in the sub category data base .
    const { categoryId } = req.params
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
    // TODO : add the user code here after creating use APIs
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
        customId: customId
    })
    if (!saveSubCat) {
        return next(new Error("couldn't save sub category in data base!", { cause: 400 }))
    }
    res.json({
        message: "sub category added successfully !",
        subCategory: saveSubCat
    })
}

export const test = (req, res, next) => {
    res.json({
        message: "test!"
    })
}

export const getAllSubCategories = async (req, res, next) => {
    const subCategories = await subCategoryModel.find().populate([
        {
            path: 'categoryId',
            select: 'slug'
        }
    ])
    res.status(200).json({
        message: "done",
        subCategories
    })
}

// TODO : delete , update sub categories