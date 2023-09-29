import { systemRoles } from '../../utilities/systemRoles.js'

export const orderAPIroles = {
    createOrder: [systemRoles.USER],
    convertCartToOrder: [systemRoles.USER]
}