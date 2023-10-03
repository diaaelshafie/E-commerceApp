// this file is like the end points file in other modules (for authorization parameters)
import { systemRoles } from '../../utilities/systemRoles.js'

export const ReviewAPIroles = {
    addReview: [systemRoles.USER]
}