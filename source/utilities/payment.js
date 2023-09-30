// this file is for connecting the project to the stripe account API
import stripe from 'stripe'


export const stripePayment = async ({
    payment_method_types = ['card'],
    mode = 'payment',
    customer_email = '',
    metadata = {},
    success_url,
    cancel_url,
    discounts = [],
    line_items = []
}) => {
    // we now established the connection to the stripe account for payments
    const stripeData = new stripe(process.env.stripe_secret_key)
    // we need to make a session for the transaction to happen
    const paymentData = await stripeData.checkout.sessions.create({
        payment_method_types, // required parameter
        mode, // required parameter
        customer_email, // optional parameter
        metadata, // optional
        success_url, // required parameter
        cancel_url, // required parameter
        discounts, // optional
        line_items
    })
}

// [{
//     price_data: {
//         currency,
//         product_data: {
//             name
//         },
//         unit_amount
//     },
//     quantity
// }],// required