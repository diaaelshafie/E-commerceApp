import { systemRoles } from '../../utilities/systemRoles.js'

export const authAPIroles = {
    forgetPassword: [systemRoles.ADMIN, systemRoles.SUPERADMIN, systemRoles.USER],
    resetPassword: [systemRoles.ADMIN, systemRoles.SUPERADMIN, systemRoles.USER]
}