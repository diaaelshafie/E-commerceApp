# E-commerce app

=============================

## topics

1. refresh tokens and token functions .
2. requirements gathering .
3. slugging .
4. agile software architecture .
5. generalFields in joi validation .
6. merge params
7. cursor
8. virtuals .
9. nested populate , nested virtuals
10. product model tracking
11. pagination .
12. search , select , sort , filters for results .
13. api features class that will contain the above line methods .
14. objectId validation .
15. hooks
16. forget , reset password APIs
17. CRON to change coupon status
18. validation errors in general response
19. (mongoose find methods).lean() -> converts BSON to changeable object , you can't use save() with it .
20. accessing an array inside a mongoose query
21. to increment or decrement a field in a collection using `$inc` operator in the findAndUpdate mongoose methods .
22. headers validation
23. authorization -> can be made in the same file as the authentication
24. create order invoice using PDF kit
25. `DEPLOYMENT OF THE PROJECT , STEPS NEEDED ARE BELOW :`
26. mongoDB atlas (convert the database into cloud)
27. use CORS to allow any one from the front end to connect or if you want to restrict , make a whitelist to control the IPs , domains to connect or to hit the APIs .
28. modify some things in the package JSON (engines , "start"script , download the nodemon dependency in the project)
29. git hub upload
30. order qr code
31. payment with stripe , `note: don't use a real credit card in the developers mode or the test mode , use a test card from the ones given in the documentation!`

## TODOS

1. continue the user dependent controllers edits .
2. and test those APIs again after the edits .
3. find the missing lecture that explains the auto token refresh , the edited user auth .

## to do topics

1. fs for streaming , integration of nodejs with gps , links to look in : <https://www.bing.com/search?q=socket.io+for+streaming&cvid=7affc0eca7134565b19e7ef60084a33f&aqs=edge..69i57j69i64.11838j0j4&FORM=ANAB01&PC=U531> , <https://www.npmjs.com/package/socket.io-stream> **github link :** <https://github.com/AhmedBhati/video-streaming-with-flask-socketio>
2. connect with an AI model
3. Validation errors , render , redirect
4. .fields() can ignore multiple files

## modules building flow

1. category
2. sub category
3. brand

====================================================================================

## slugging

- 3rd party module : slugify
- npm command : npm i slugify
- documentation link : <https://www.npmjs.com/package/slugify>

- notes :

  1. slugify replaces spaces only .
  2. if there is no space , nothing will change .
  3. it ignores spaces at the beginning , end .

================================================================================================

## to validate a mongoose document object _id using joi

- this is the `regex` of a mongoose object _id of a document : `/^[0-9a-fA-F]{24}$/`

    ```js
        params: joi.object({
        categoryId: joi.string().regex(/^[0-9a-fA-F]{24}$/)
        })
    ```

================================================================================================

## BSON

- bson is binary JSON .
- it's what comes from the mongoDB documents .
- it cannot be modified (add a field) , but can have an existing field's value changed .
- it seems like an object when it comes from the data base but it's not .
- to convert it into an actual object that it can edit or modify , use `.toObject()` -> this only affects the returned document not the actual data base document .

===================================================================================================

## virtuals

- imaginary data base fields that can be modified and will return with the response but will not be stored in the data base document .
- they cannot be accessed after being sent (on-fly fields) .
- % you can only make one virtual per model .
- to create a virtual : use the method `exampleSchema.virtual()` not 'exampleSchema.virtuals()'
- in the timeStamps object in the model , we must define the following :

  ```js
    // toJSON allows the virtual in the response to be read by it as the response reads JSON .
    toJSON: { virtuals: true },
    // this allows us to modify and deal with the virtual in the code if needed and to render it in the response
    toObject: { virtuals: true }
  ```

### nested virtuals or nested populate

- to implement it :

  ```js
        const categories = await categoryModel.find().populate([
        {
            path: 'subCategories',
            populate: [
                {
                    path: 'brands',
                    // select: 'name'
                }
            ]
        }
    ])
  ```

==================================================================================================

## pagination

- it's segmentation of the response data into pages .
- done in utils .
- pages are preferrably sent in the query part of the request .
- pagination is applied to the return of the search (query methods) after the data return -> it doesn't page the documents of the data base then search through them , it does paging after the data return from the search .
- mongoose has 2 methods after the finding methods for pagination :

  ```js
    const products = await productModel.find().limit(limit).skip(skip)
  ```

==================================================================================================

## filtering , sorting , selecting , searching

### filtering

- you need to make sure that the API will only recieve one field in the request query :
- the front end sends the data like this in the request (in postman in Query params part) : `fieldName[operator without the '$' sign]            field value` , ex :
`in post man : price[gte]    20000` , this translates to in the code : `price: {gte : '20000'}`
- TODO : how to make the code makes the value of the field into a number
- to apply the concept for ex :

```js
    // filter : => done before but statically like this :
    const filterProducts = await productModel.find({
        price: {
            $gte: 40000
        }
    })
    // to do it dynamically (take the condition from the query) -> the request.query must have nothing more else than the condition :
    // to take the query from the request -> store it in a variable 
    const queryinstance = { ...req.query }
    console.log(queryinstance)
    // but the front end won't send the '$' sign for to take it directly as it's against security , so we need to stringify it , change it's format , then return it and send it to the query method
    // the front end sends the data like this in the request (in postman in Query params part) : fieldName[operator without the '$' sign]            field value
    const queryString = JSON.parse(JSON.stringify(queryinstance).replace(
        /gt|gte|lt|lte|in|nin|eq|neq|regex/g, (match) => `$${match}`
    ))
    const filterProducts = await productModel.find(req.query)
    res.status(200).json({
        message: "done",
        products: filterProducts
    })
```

### sorting , selecting , searching

- the front end will send the query fields in a string separated by a ',' -> we need to replace them with ' ' so that the query method can read them , the method is `string.replaceAll('char to replace','char to replace with')`

```js
    // the front end will send the query fields in a string separated by a ',' -> we need to replace them with ' ' so that the query method can read them 
    const { select, sort, search } = req.query

    // sort :
    // method .sort() takes a string with the name of the field to sort results with (sorting value) , and another string with how you want to sort them (sorting order) .
    // , writing '-' before the sorting value makes it descendingly sorted automatic
    const sortProducts = await productModel.find().sort(sort.replaceAll(',', ' '))

    // select :
    const selectProducts = await productModel.find().select(select.replaceAll(',', ' '))

    // search :
    const searchProducts = await productModel.find({
        $or: [
            { title: { $regex: search.replaceAll(',', ' '), $options: 'i' } },
            { desc: { $regex: search.replaceAll(',', ' '), $options: 'i' } },
        ]
    })

    res.status(200).json({
        message: "done!",
        products: sortProducts
    })
```

==============================================================================================================================================================================

## hooks

- to tell a code to do something after/before something .
- done at the data base schemas .
- at the `userModel.js` file :

  ```js
    // hooks methods are either : pre -> before , post -> after 
    // V.IMP NOTE : if you intend to use the method of the hook more than once but not all the time , it's better not to use the hooks as they will apply to every time you will use that method specified

    // pre must have 2 parameters (next,hash) , next is an important one , hash isn't
    userSchema.pre('save', function (next, hash) {
        this.password = bcrypt.hashSync(this.password, +process.env.SIGN_UP_SALT_ROUNDS)
        next()
    })

    // post doesn't have any parameters
  ```

- `V.IMP NOTE` : if you intend to use the method of the hook more than once but not all the time , it's better not to use the hooks as they will apply to every time you will use that method specified otherwise , make sure that you use a similar method so it doesn't do the same logic again without wanting that like `hashing password twice`

===============================================================================================================================================================================

## notes

1. % the normal for loop doesn't await something unless it's writtin in the condition .
2. `for of` loop can await what's within it's iteration .
3. to delete folders from cloudinary , you must first delete their assets as they won't be deleted if they have assets , so :
  
  ```js
    // this will delete every asset in the folders and go in their embedded folder and delete their assets .
    await cloudinary.api.delete_resources_by_prefix(`${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}`)
    // this will delete the folders and their embedded folders once you removed them .
    await cloudinary.api.delete_folder(`${process.env.PROJECT_UPLOADS_FOLDER}/categories/${getCategory.customId}`)
  ```

4.ternary operators can be written like this (this got an error) :

  ```js
  // this is a ternary operator in the variable definition
  const priceAfterDiscount = (price * (1 - (appliedDiscount || 0 / 100)))
  ```

===============================================================

## PDF kit

============

- documentation links :
  1. <https://pdfkit.org/>
  2. <https://www.npmjs.com/package/pdfkit>

================================================================

## CORS

========

- it controles the IPs , domains from the frontend that can hit or connect to your backend APIs .
- it does that by making a whitelist for the allowed origins (IP or domain) then it checks the origin of the request if it's included in the whitelist or not .

=================================================================

## git hub upload

===================

- steps to upload a github project :
  1. create a git hub repository .
  2. get the repository link from the code section
  3. open the terminal (or the cmd) at the project path
  4. write the commands below :

- commands for uploading for the first time :
  1. `git init`
  2. `git add .`
  3. `git commit -m "name of the uplad"`.
  4. `git branch -M main`.
  5. `git remote add origin repoLink`
  6. `git push -u origin main`

- commands for re-uploading (for updates) an existing or uploaded repo :
  1. `git remote add origin repoLink`.
  2. `git branch -M main`.
  3. `git push -u origin main`

- commands for updating the code uploaded on the repo :
  1. `git add .`
  2. `git commit -m "name of the upload (preferred to be the same name of the existing upload)"`
  3. `git push -u origin main`
