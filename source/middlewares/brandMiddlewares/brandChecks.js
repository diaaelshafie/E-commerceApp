// addBrand API Checks
export const checkNewBrandData = (req, res, next) => {
    const { categoryId, subCategoryId } = req.query
    if (!req.file) {
        return false
    }
    if (!req.body.name) {
        return false
    }
    if (!categoryId) {
        return false
    }
    if (!subCategoryId) {
        return false
    }
    next()
}

// export const checkNewBrandData = () => {
//     return async (req, res, next) => {
//         if (!req.file) {
//             return res.status(400).json({
//                 message: "please insert the brand logo"
//             })
//         }
//         if (!req.body.name) {
//             return res.status(400).json({
//                 message: "please enter the brand name!"
//             })
//         }
//         if (!req.qeury?.categoryId) {
//             return res.status(400).json({
//                 message: "please enter the related category id!"
//             })
//         }
//         if (!req.query?.subCategoryId) {
//             return res.status(400).json({
//                 message: "please enter the related sub category id!"
//             })
//         }
//         next()
//     }
// }