// we will build the api features class

import { paginationFunction } from "./pagination.js"

export class ApiFeatures {
    // mongoose query is the query for the data base
    // query data is req.query part 
    constructor(mongooseQuery, queryData) {
        this.mongooseQuery = mongooseQuery 
        this.queryData = queryData
    }

    // pagination :
    pagination() {
        const { page, size } = this.queryData
        const { limit, skip } = paginationFunction({ page, size })
        this.mongooseQuery.limit(limit).skip(skip)
        return this
    }

    // sort :
    sort() {
        this.mongooseQuery.sort(this.queryData.sort.replaceAll(',', ' '))
        return this
    }

    // select :
    select() {
        this.mongooseQuery.select(this.queryData.select?.replaceAll(',', ' '))
        return this
    }

    // filter 
    filter() {
        const queryinstance = { ...this.queryData }
        console.log(queryinstance)

        const execludeArr = ['page', 'size', 'sort', 'select', 'search']
        execludeArr.forEach((key) => delete queryinstance[key])

        const queryString = JSON.parse(JSON.stringify(queryinstance).replace(
            /gt|gte|lt|lte|in|nin|eq|neq|regex/g, (match) => `$${match}`
        ))
        this.mongooseQuery.find(queryString)
        return this
    }
}