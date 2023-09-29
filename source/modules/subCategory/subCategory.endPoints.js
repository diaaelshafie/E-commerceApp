import { systemRoles } from '../../utilities/systemRoles.js'

export const subCategoryAPIroles = {
    createSubCategory: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    getAllSubCategories: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
}