import { systemRoles } from '../../utilities/systemRoles.js'

export const categoryAPIroles = {
    ADDCATEGORY: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    UPDATECATEGORY: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    GETALLCATEGORIESWITHSUBS: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
    DELETECATEGORY: [systemRoles.ADMIN, systemRoles.SUPERADMIN],
}