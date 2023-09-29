import { systemRoles } from '../../utilities/systemRoles.js'

export const productAPIroles = {
    addProduct: [systemRoles.ADMIN],
    updateProducts: [systemRoles.ADMIN],
    getAllProducts: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    searchProductsByTitile: [systemRoles.ADMIN, systemRoles.SUPERADMIN, systemRoles.USER],
    listProducts: [systemRoles.ADMIN, systemRoles.SUPERADMIN, systemRoles.USER],
    filterProducts: [systemRoles.ADMIN, systemRoles.SUPERADMIN, systemRoles.USER],
    apiFeatures: [systemRoles.ADMIN, systemRoles.SUPERADMIN, systemRoles.USER]
}