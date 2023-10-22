import { systemRoles } from '../../utilities/systemRoles.js'

export const brandAPIroles = {
    ADDBRAND: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    updateBrand: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    getAllBrands: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    deleteBrand: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    forceDeleteBrands: [systemRoles.SUPERADMIN]
}