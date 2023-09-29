// this file has the functions for creating an order invoice pdf

import fs from 'fs'
import PDFdocument from 'pdfkit'
import path from 'path'

function createInvoice(invoice, pathVar) {
    let doc = new PDFdocument({ size: 'A4', margin: 50 })

    generateHeader(doc)
    generateCustomerInformation(doc, invoice)
    generateInvoiceTable(doc, invoice)
    generateFooter(doc)

    doc.end()

    doc.pipe(fs.createWriteStream(path.resolve(`./files/${pathVar}`)))
}

function generateHeader(doc) {
    doc
        .image('image name', 50, 45, { width: 50 })
        .fillColor('#444444')
        .fondSize(20)
        .text('E-commerce store', 110, 57)
        .fillColor('#09c')
        .fontSize(10)
        .text('E-commerce store', 200, 50, { align: 'right' })
        .text('branch: Suez', 200, 65, { align: 'right' })
        .text('Suez,Egypt', 200, 80, { align: 'right' })
        .moveDown()
}

function generateCustomerInformation(doc, invoice) {

    doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160)
    generateHr(doc, 185)

    // the below vaiable is used as a constant y-axis distance in the below doc methods
    const customerInformationTop = 200

    doc
        .fontSize(10)
        .text('Order code:', 50, customerInformationTop)
        .font('Helvetica-Bold')
        .text(invoice.orderCode, 150, customerInformationTop)
        .font('Helvetica')
        .text('Invoice Date:', 50, customerInformationTop)
        .text(formatDate(new Date(invoice.date)), 150, customerInformationTop + 30)
        .font('Helvetica-Bold')
        .text(invoice.shipping.name, 300, customerInformationTop)
        .font('Helvetica')
        .text(invoice.shipping.address, 300, customerInformationTop + 15)
        .text(
            invoice.shipping.city +
            ', ' +
            invoice.shipping.state +
            ', ' +
            invoice.shipping.country,
            300,
            customerInformationTop + 30,
        )
        .moveDown()

    generateHr(doc, 252)
}


function generateInvoiceTable(doc, invoice) {
    let i
    const invoiceTableTop = 330

    doc.font('Helvetica-Bold')
    generatetableRow(
        doc,
        invoiceTableTop,
        'Item',
        'Unit cost',
        'Quantity',
        'Line total'
    )
    generateHr(doc, invoiceTableTop + 20)
    doc.font('Helvetica')

    for (i = 0; i < invoice.items.length; i++) {
        const item = invoice.items[i]
        const position = invoiceTableTop + (i + 1) * 30
        generatetableRow(
            doc,
            position,
            item.title,
            formatCurrency(item.price),
            item.quantity,
            formatCurrency(item.finalPrice),
        )
    }

    const subTotalPosition = invoiceTableTop + (i + 1) * 30
    generatetableRow(
        doc,
        subTotalPosition,
        '',
        '',
        'SubTotal',
        '',
        formatCurrency(invoice.subTotal),
    )

    const paidToDatePosition = subTotalPosition + 20
    generatetableRow(
        doc,
        paidToDatePosition,
        '',
        '',
        'Paid Amount',
        '',
        formatCurrency(invoice.paidAmount)
    )

    doc.font('Helvetica')
}

function generateFooter(doc) {

}

function generatetableRow(
    doc,
    y,
    item,
    description,
    unitCost,
    quantity,
    lineTotal
) {
    doc
        .fontSize(10)
        .text(item, 50, y)
        .text(description, 150, y)
        .text(unitCost, 280, y, { width: 90, align: 'right' })
        .text(quantity, 370, y, { width: 90, align: 'right' })
        .text(lineTotal, 0, y, { align: 'right' })
}

function generateHr(doc, y) {
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke()
}

function formatCurrency(cents) {

}

function formatDate(date) {

}

export default createInvoice