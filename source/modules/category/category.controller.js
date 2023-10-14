import {
    slugify, cloudinary, categoryModel, customAlphabet, subCategoryModel, brandModel, productModel
} from './category.imports.js'

const nanoid = customAlphabet('1gdsf3hlk2_-#po!', 6)

// create category :
export const createCategory = async (req, res, next) => {
    const { name } = req.body
    const { _id } = req.authUser
    // to create slugs : 
    const slug = slugify(name, '_')
    if (await categoryModel.findOne({ name })) {
        return next(new Error('category name already exists!', { cause: 400 }))
    }
    if (!req.file) {
        return next(new Error('please send an image', { cause: 400 }))
    }
    // host the image : 
    // we need to make a custom id to put it as a name in the host media .
    const customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${customId}`
    })
    const categoryData = {
        name,
        slug,
        image: {
            secure_url,
            public_id
        },
        customId,
        createdBy: _id
    }
    const category = await categoryModel.create(categoryData)
    if (!category) {
        await cloudinary.uploader.destroy(public_id)
        return next(new Error('failed to add the category', { cause: 400 }))
    }
    res.json({
        message: "adding is successfull",
        category
    })
}

// update category :
export const updateCategory = async (req, res, next) => {
    const { name } = req.body
    const { _id } = req.authUser
    // we need the category _id of the database document 
    const { categoryId } = req.params
    const findCategory = await categoryModel.findOne({ _id: categoryId, createdBy: _id })
    if (!findCategory) {
        return next(new Error("couldn't find the category!", { cause: 400 }))
    }
    if (name) {
        if (findCategory.name == name.toLowerCase()) {
            return next(new Error('enter a different name!', { cause: 400 }))
        }
        if (await categoryModel.findOne({ name })) {
            return next(new Error('this name exists! , duplicate name', { cause: 400 }))
        }
        findCategory.name = name
        findCategory.slug = slugify(name, '_')
    }

    if (req.file) {
        await cloudinary.uploader.destroy(findCategory.image.public_id)
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${findCategory.customId}`
        })
        findCategory.image = {
            secure_url,
            public_id
        }
    }
    findCategory.updatedBy = _id
    findCategory.__v++
    await findCategory.save()
    res.json({
        message: "update is done!",
        category: findCategory
    })
}

// this API is to make a parent that doesn't see his children to get them with him (indirectionally)
export const getAllCategoriesWithTheirSubs = async (req, res, next) => {
    // method 1: 

    // const categories = await categoryModel.find()
    // const categoriesArray = []
    // for (const category of categories) {
    //     const subCategory = await subCategoryModel.find({
    //         categoryId: category._id
    //     })
    //     const objCategory = category.toObject()
    //     objCategory.subCategory = subCategory
    //     categoriesArray.push(objCategory)
    // }

    // another method for the above logic : 
    const categoriesArray = []
    const cursor = await categoryModel.find().cursor()
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        const subCategory = await subCategoryModel.find({
            categoryId: doc._id
        })
        const objCategory = doc.toObject()
        objCategory.subCategory = subCategory
        categoriesArray.push(objCategory)
    }
    res.status(200).json({
        message: "done",
        categoriesWithSubs: categoriesArray
    })
}

// TODO : update products that is related to the category when it's model is made
export const getAllCategoriesWithSubsWithVirtuals = async (req, res, next) => {
    const categories = await categoryModel.find().populate([
        {
            path: 'subCategories',
            populate: [
                {
                    path: 'brands',
                    // select: 'name'
                }
            ]
        }
    ])
    console.log(categories)
    res.status(200).json({
        message: "done",
        categoriesWithSubs: categories
    })
}

export const deleteCategory = async (req, res, next) => {
    const { _id } = req.authUser
    const { categoryId } = req.query
    let messages = []
    const getCategory = await categoryModel.findOneAndDelete({ _id: categoryId, createdBy: _id })
    if (!getCategory) {
        // category either not found or an invalid one !
        return next(new Error("invalid category id!", { cause: 400 }))
    }
    await cloudinary.uploader.destroy(getCategory.image.public_id)
    const deleteRelatedSubCategory = await subCategoryModel.deleteMany({
        categoryId
    })
    if (!deleteRelatedSubCategory.deletedCount) {
        // if this logic happened , this means that the related sub categories are not found , the category has no related subs
        messages.push("there are no related subCategories found!")
    }
    const deleteRelatedBrand = await brandModel.deleteMany({
        categoryId
    })
    if (!deleteRelatedBrand.deletedCount) {
        // if this logic is done , it means that the category has no related brands
        messages.push("there are no related brands found!")
    }
    const deleteRelatedProducts = await productModel.deleteMany({
        categoryId
    })
    if (!deleteRelatedProducts.deletedCount) {
        messages.push("there are no related products found!")
    }
    // we need to loop on every sub category , brand , product to delete their images and their folders on the media host .
    await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}`)
    await cloudinary.api.delete_folder(`${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}`)
    res.status(200).json({
        message: 'delete is successfull!',
        categoryDeleted: getCategory,
        messages
    })
}