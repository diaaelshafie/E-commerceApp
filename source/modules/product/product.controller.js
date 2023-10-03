import {
    slugify, productModel, cloudinary, customAlphabet, categoryModel, subCategoryModel, brandModel,
    paginationFunction, ApiFeatures,
} from './product.controller.imports.js'

const nanoid = customAlphabet('1gdsf3hlk2_-#po!', 6)

// TODO : add created by , user related data when the user model is made .
export const addProduct = async (req, res, next) => {
    const { categoryId, subCategoryId, brandId } = req.query
    const { title, desc, colors, sizes, stock, price } = req.body
    let appliedDiscount = req.body.appliedDiscount
    // TODO : the below code is repeated in alot of APIs , put it in a function or an utility
    const getCategory = await categoryModel.findById(categoryId)
    if (!getCategory) {
        return next(new Error("the category entered doesn't exists", { cause: 400 }))
    }
    const getSubCategory = await subCategoryModel.findById(subCategoryId)
    if (!getSubCategory) {
        return next(new Error("the sub category entered doesn't exists", { cause: 400 }))
    }
    const getBrand = await brandModel.findById(brandId)
    if (!getBrand) {
        return next(new Error("the brand entered doesn't exists", { cause: 400 }))
    }
    const checkCatSubCatRelated = await subCategoryModel.findOne({
        _id: subCategoryId,
        categoryId
    })
    if (!checkCatSubCatRelated) {
        return next(new Error("the enetered category , sub category aren't related!", { cause: 400 }))
    }
    const checksubCateBrandRelated = await brandModel.findOne({
        _id: brandId,
        categoryId,
        subCategoryId
    })
    if (!checksubCateBrandRelated) {
        return next(new Error("the enetered sub category , brand aren't related!", { cause: 400 }))
    }
    const sluggedTitle = slugify(title, '_')
    const customId = nanoid()
    let priceAfterDiscount
    if (appliedDiscount) {
        priceAfterDiscount = (price - (price * (appliedDiscount / 100)))
    } else {
        appliedDiscount = 0
    }
    // this is a ternary operator in the variable definition
    // const priceAfterDiscount = (price - (price * (appliedDiscount || 0 / 100))) -> this got an error
    const images = [] // this is needed for data base storing
    const publicIds = [] // this is needed to delete bulk images if the upload didn't succeed
    // console.log({
    //     catcustId: getCategory.customId,
    //     subCatCustId: getSubCategory.customId,
    //     brandCustId: getBrand.customId
    // })
    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
            folder:
                `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getBrand.customId}/products/${customId}`
        })
        if (!secure_url || !public_id) {
            return next(new Error('failed to store images in the cloud media host', { cause: 400 }))
        }
        images.push({ secure_url, public_id })
        publicIds.push(public_id)
    }
    // if for some reason the API failed before the data base failed and so it will won't delete the images uploaded .
    req.imagePath = `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getBrand.customId}/products/${customId}`
    // we may need to add `products` field in the database in the category , sub , brand and add the product in it
    const productData = {
        title, desc, colors,
        sizes, stock, price,
        appliedDiscount: appliedDiscount || 0,
        categoryId, subCategoryId,
        brandId, priceAfterDiscount, customId,
        slug: sluggedTitle,
        images: images
    }
    // TODO : handle the error that may go to .catch in async handler here .
    const saveProduct = await productModel.create(productData)
    if (!saveProduct) {
        await cloudinary.api.delete_resources(publicIds)
        return next(new Error('failed to save in the data base !', { cause: 400 }))
    }
    res.status(201).json({
        message: "product added successfully!",
        product: saveProduct
    })
}

export const updateProduct = async (req, res, next) => {
    // TODO : if the user wants to either keep or delete old : images , sizes , colors ?
    // the front end will send the fields it only wants to update .
    const {
        title, desc, colors, price, appliedDiscount, stock
    } = req.body
    const sizes = +req.body.sizes
    const {
        productId, categoryId, subCategoryId, brandId
    } = req.query
    if (!productId) {
        return next(new Error('please send a product ID !', { cause: 400 }))
    }
    const getProduct = await productModel.findById(productId)
    if (!getProduct) {
        return next(new Error('invalid product ID !', { cause: 400 }))
    }
    let getCategory, oldCategory
    if (categoryId) {
        getCategory = await categoryModel.findById(categoryId)
        if (!getCategory) {
            return next(new Error('invalid category ID !', { cause: 400 }))
        }
        getProduct.categoryId = categoryId
    } else {
        oldCategory = await categoryModel.findById(getProduct.categoryId)
    }
    let getSubCategory, oldSubCategory
    if (subCategoryId) {
        getSubCategory = await subCategoryModel.findById(subCategoryId)
        if (!getSubCategory) {
            return next(new Error('invalid category ID !', { cause: 400 }))
        }
        getProduct.subCategoryId = subCategoryId
    } else {
        oldSubCategory = await subCategoryModel.findById(getProduct.subCategoryId)
    }
    let getBrand, oldBrand
    if (brandId) {
        getBrand = await brandModel.findById(brandId)
        if (!getBrand) {
            return next(new Error('invalid category ID !', { cause: 400 }))
        }
        getProduct.brandId = brandId
    } else {
        oldBrand = await brandModel.findById(getProduct.brandId)
    }
    // const checkCatSubCatRelated = await subCategoryModel.findOne({
    //     _id: subCategoryId,
    //     categoryId
    // })
    // const checkBrandRelated = await brandModel.findOne({
    //     _id: brandId,
    //     subCategoryId,
    //     categoryId
    // })
    // if (!checkCatSubCatRelated || !checkBrandRelated) {
    //     return next(new Error('categories are not related !', { cause: 400 }))
    // }
    if (title) {
        if (getProduct.title === title.toLowerCase()) {
            return next(new Error('enter a different product title , duplicates !', { cause: 400 }))
        }
        getProduct.title = title
        getProduct.slug = slugify(title, {
            replacement: '_'
        })
    }
    if (desc) {
        if (getProduct.desc === desc) {
            return next(new Error('enter a different product description , duplicates !', { cause: 400 }))
        }
        getProduct.desc = desc
    }
    if (colors) {
        if (!getProduct.colors.length) {
            getProduct.colors.push(colors)
        }
        // this checks if there are two same colors inserted , if the colors inserted exists or not 
        // this inserts the new colors in the data base direclty
        else {
            for (const color of colors) {
                if (getProduct.colors.includes(color)) {
                    return next(new Error(`the ${color} color already exists , duplicates`, { cause: 400 }))
                }
                getProduct.colors.push(color)
            }
        }
    }
    if (sizes) {
        if (!getProduct.sizes.length) {
            getProduct.sizes.push(sizes)
        }
        // this checks if there are two same sizes inserted , if the sizes inserted exists or not 
        // this inserts the new sizes in the data base direclty
        else {
            for (const size of sizes) {
                if (getProduct.sizes.includes(size)) {
                    return next(new Error(`the ${size} color already exists , duplicates`, { cause: 400 }))
                }
                getProduct.sizes.push(size)
            }
        }
    }
    if (price) {
        if (getProduct.price === price) {
            return next(new Error('enter a different product price , duplicates !', { cause: 400 }))
        }
        getProduct.price = price
        getProduct.priceAfterDiscount = (price - (price * (getProduct.appliedDiscount / 100)))
    }
    else if (price && appliedDiscount) {
        if (getProduct.price === price) {
            return next(new Error('enter a different product price , duplicates !', { cause: 400 }))
        }
        getProduct.price = price
        if (getProduct.appliedDiscount === appliedDiscount) {
            return next(new Error('enter a different product discount , duplicates !', { cause: 400 }))
        }
        getProduct.appliedDiscount = appliedDiscount
        getProduct.priceAfterDiscount = (price - (price * (appliedDiscount / 100)))
    }
    else if (appliedDiscount) {
        if (getProduct.appliedDiscount === appliedDiscount) {
            return next(new Error('enter a different product discount , duplicates !', { cause: 400 }))
        }
        getProduct.appliedDiscount = appliedDiscount
        getProduct.priceAfterDiscount = (getProduct.price - (getProduct.price * (appliedDiscount / 100)))
    }
    if (stock) {
        if (getProduct.stock === stock) {
            return next(new Error('enter a different product stock , duplicates !', { cause: 400 }))
        }
        getProduct.stock = stock
    }
    // TODO : make the code update only one image or more and doesn't delete all the images and replace them
    if (req.files?.length) { // TODO : optional chaining in java script ?
        const images = []
        const oldPublic_ids = []
        // if all the categories , brand changed
        if (getCategory && getSubCategory && getBrand) {
            for (const file of req.files) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                    folder:
                        `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getBrand.customId}/products/${getProduct.customId}`
                })
                images.push({
                    secure_url, public_id
                })
            }
            for (const image of getProduct.images) {
                oldPublic_ids.push(image.public_id)
            }
            await cloudinary.api.delete_resources(oldPublic_ids)
            getProduct.images = images
        }
        // if only sub category , brand changed
        else if (getSubCategory && getBrand) {
            for (const file of req.files) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                    folder:
                        `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${oldCategory.customId}/subCategories/${getSubCategory.customId}/brands/${getBrand.customId}/products/${getProduct.customId}`
                })
                images.push({
                    secure_url, public_id
                })
            }
            for (const image of getProduct.images) {
                oldPublic_ids.push(image.public_id)
            }
            await cloudinary.api.delete_resources(oldPublic_ids)
            getProduct.images = images
        }
        // if only the brand changed
        else if (getBrand) {
            for (const file of req.files) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                    folder:
                        `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${oldCategory.customId}/subCategories/${oldSubCategory.customId}/brands/${getBrand.customId}/products/${getProduct.customId}`
                })
                images.push({
                    secure_url, public_id
                })
            }
            for (const image of getProduct.images) {
                oldPublic_ids.push(image.public_id)
            }
            await cloudinary.api.delete_resources(oldPublic_ids)
            getProduct.images = images
        }
        // if nothing changed
        else {
            for (const file of req.files) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                    folder:
                        `${process.env.PROJECT_UPLOADS_FOLDER}/categories/${oldCategory.customId}/subCategories/${oldSubCategory.customId}/brands/${oldBrand.customId}/products/${getProduct.customId}`
                })
                images.push({
                    secure_url, public_id
                })
            }
            for (const image of getProduct.images) {
                oldPublic_ids.push(image.public_id)
            }
            await cloudinary.api.delete_resources(oldPublic_ids)
            getProduct.images = images
        }
    }
    await getProduct.save()
    res.status(200).json({
        message: "update successfull!",
        updatedProduct: getProduct
    })
}

export const getAllProducts = async (req, res, next) => {
    const { page, size } = req.body
    const { limit, skip } = paginationFunction({ page, size })
    const products = await productModel.find().limit(limit).skip(skip)
    res.status(200).json({
        message: "done!",
        products
    })
}

// this API runs good but it fails the server when i run any other API 
export const searchProductsByTitle = async (req, res, next) => {
    const { searchKey, page, size } = req.query
    const { limit, skip } = paginationFunction({ page, size })
    const products = await productModel.find({
        $or: [
            // option : 'i'  makes the search insensitive
            { title: { $regex: searchKey, $options: 'i' } },
            { desc: { $regex: searchKey, $options: 'i' } }
        ]
    }).limit(limit).skip(skip).populate([
        {
            path: 'Reviews'
        }
    ])
    res.status(200).json({
        message: "done!",
        products
    })
}

export const listProducts = async (req, res, next) => {
    // the front end will send the query fields in a string separated by a ',' -> we need to replace them with ' ' so that the query method can read them 
    const { select, sort, search } = req.query // select , sort , search are keys the front end will send and will be used in the query methods .

    // sort :
    // method .sort() takes a string with the name of the field to sort results with (sorting value) , and another string with how you want to sort them (sorting order) .
    // , writing '-' before the sorting value makes it descendingly sorted automatic
    const sortProducts = await productModel.find().sort(sort.replaceAll(',', ' '))

    // select :
    const selectProducts = await productModel.find().select(select.replaceAll(',', ' '))

    // search :
    const searchProducts = await productModel.find({
        $or: [
            { title: { $regex: search.replaceAll(',', ' '), $options: 'i' } },
            { desc: { $regex: search.replaceAll(',', ' '), $options: 'i' } },
        ]
    })

    res.status(200).json({
        message: "done!",
        products: sortProducts
    })
}

export const filterProducts = async (req, res, next) => {

    const queryinstance = { ...req.query }
    console.log(queryinstance)
    const queryString = JSON.parse(JSON.stringify(queryinstance).replace(
        /gt|gte|lt|lte|in|nin|eq|neq|regex/g, (match) => `$${match}`
    ))
    const filterProducts = await productModel.find(queryString)
    res.status(200).json({
        message: "done",
        products: filterProducts
    })
}

export const filterWithTheRest = async (req, res, next) => {
    // const {sort , select , search , page , size} = req.query

    const queryinstance = { ...req.query }
    console.log(queryinstance)

    const execludeArr = ['page', 'size', 'sort', 'select', 'search']
    execludeArr.forEach((key) => delete queryinstance[key])

    const queryString = JSON.parse(JSON.stringify(queryinstance).replace(
        /gt|gte|lt|lte|in|nin|eq|neq|regex/g, (match) => `$${match}`
    ))

    // if i want to use any thing else with filtering like sort , pagination , select , search :
    const filterProducts = await productModel.find(queryString).
        sort(req.query.sort.replaceAll(',', ' '))

    res.status(200).json({
        message: "done",
        products: filterProducts
    })
}

export const usingApiFeatures = async (req, res, next) => {
    const ApiFeaturesInstance = new ApiFeatures(productModel.find({}), req.query).pagination().filter()
    const products = await ApiFeaturesInstance.mongooseQuery
    res.status(200).json({
        message: "done",
        products
    })
}

// TODO : delete products 