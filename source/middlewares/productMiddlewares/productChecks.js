export const checkNewProdcutData = () => {
    return async (req, res, next) => {
        const { categoryId, subCategoryId, brandId } = req.query
        const { title, stock, price } = req.body
        if (!req.files) {
            return res.status(400).json({
                message: "please insert the product images"
            })
        }
        if (!title || !stock || !price) {
            return res.status(400).json({
                message: "you must enter a title , the number of stock and the original price of the product!"
            })
        }
        if (!categoryId) {
            return res.status(400).json({
                message: "please enter the related category id!"
            })
        }
        if (!subCategoryId) {
            return res.status(400).json({
                message: "please enter the related sub category id!"
            })
        }
        if (!brandId) {
            return res.status(400).json({
                message: "please enter the related brand id!"
            })
        }
        next()
    }
}