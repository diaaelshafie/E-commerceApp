import { systemRoles } from '../../utilities/systemRoles.js'

export const subCategoryAPIroles = {
    createSubCategory: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    getAllSubCategories: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    updateSubCategory: [systemRoles.USER, systemRoles.ADMIN],
    deleteSubcategory: [systemRoles.USER, systemRoles.ADMIN],
    forceDeleteSubCategory: [systemRoles.ADMIN, systemRoles.SUPERADMIN]
} 