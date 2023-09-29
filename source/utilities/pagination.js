// pagination
export const paginationFunction = ({ page = 1, size = 2 }) => {
    if (page < 1) page = 1
    if (size < 1) size = 2
    // limit is the amount of the data base docs that will be returned
    const limit = size
    // skip is how many of documents in the data base that will be skipped to get the data in turn
    const skip = (page - 1) * size

    return ({ limit, skip })
}