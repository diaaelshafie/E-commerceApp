import multer from 'multer'
import { allowedExtensions } from '../utilities/allowedUploadExtensions.js'

export const multerHostFunction = (extensions = []) => {
    if (!extensions) {
        extensions = allowedExtensions.image
    }
    const multerStorage = multer.diskStorage({})
    const fileUplaod = multer({
        storage: multerStorage
    })
    return fileUplaod
}