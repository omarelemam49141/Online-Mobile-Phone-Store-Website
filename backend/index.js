const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json({limit: "10mb", extended: true}));
app.use(express.urlencoded({limit: "10mb", extended: true, parameterLimit: 50000}));

app.use(cors());
app.use(bodyparser.json());

// database connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'oeams7476386',
//     database: 'elkoryphone'
// });
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'oeams7476386',
//     database: 'elkoryphone'
// });
// const db = mysql.createConnection({
//     host: 'database-1.cszl3qqymczg.eu-north-1.rds.amazonaws.com',
//     user: 'admin',
//     port: 3308,
//     password: 'oeams7476386',
//     database: 'elkoryPhoneDB'
// });
const db = mysql.createConnection({
    host: 'mysql-123826-0.cloudclusters.net',
    user: 'admin',
    port: 10090,
    password: '6Yt0WWbJ',
    database: 'elkoryphone'
});

// check database
db.connect(err=> {
    if (err) {
        console.log(err,'error');
    }

    console.log('connected');
})

// get all products
app.get('/allProducts/pages/:pageNumber/:limit/:sorting', (req, res) => {
    let limit = req.params.limit;
    let pageNumber = req.params.pageNumber * limit;
    let sorting = req.params.sorting;
    let sortField = 'id';
    let sortingOrder = 'DESC';

    if (sorting == 'highest') {
        sortField = 'price';
        sortingOrder = 'DESC';
    } else if (sorting == 'lowest') {
        sortField = 'price';
        sortingOrder = 'ASC';
    } else {
        sortField = 'id';
        sortingOrder = 'DESC';
    }

    let qr = `select * from product ORDER BY ${sortField} ${sortingOrder} limit ${limit} offset ${pageNumber}`;
    let qr2 = `select count (*) from product`;

    db.query(qr, (err, result) => {
        db.query(qr2, (err2, result2) => {
            if (err2 || err) {
                console.log('error1: ' + err + ' error2' + err2);
            }
    
            if (result.length > 0) {
                res.send({
                    message: 'all products...',
                    data: result,
                    dataLength: result2[0]['count (*)']
                })
            } else {
                res.send({
                    data: 'no data',
                    dataLength: 0
                })
            }
        })
    })
})

//get products length
app.get('/allProductsLength', (req, res) => {
    let qr = `select count (*) from product`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error1: ' + err);
        }

        res.send({
            message: 'all products...',
            newIdNumber: result[0]['count (*)']
        })
    })
})

//search products
app.get('/allProductsSearch/:value', (req, res) => {
    let value = req.params.value;
    let qr = `select * from product where title like '%${value}%'`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error1: ' + err);
        }

        if (result) {
            if (result.length > 0) {
                res.send({
                    message: 'all products...',
                    data: result,
                    dataLength: result.length
                })
            } else {
                res.send({
                    data: []
                })
            }
        }
    })
})

//search products exact title
app.get('/allProductsSearchExact/:value', (req, res) => {
    let value = req.params.value;
    let qr = `select * from product where title = '${value}'`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error1: ' + err);
        }

        if (result) {
            if (result.length > 0) {
                res.send({
                    message: 'all products...',
                    dataLength: 1
                })
            } else {
                res.send({
                    dataLength: 0
                })
            }
        }
    })
})

// get products by category
app.get('/allProducts/category/:category/:subTitle/:subCategory/:pageNumber/:limit/:sorting', (req, res) => {
    let category = req.params.category;
    let subTitle = req.params.subTitle;
    let subCategory = req.params.subCategory;
    let limit = req.params.limit;
    let pageNumber = req.params.pageNumber * limit;
    let qr;
    let qr2;
    let sorting = req.params.sorting;
    let sortField = 'id';
    let sortingOrder = 'DESC';

    if (sorting == 'highest') {
        sortField = 'price';
        sortingOrder = 'DESC';
    } else if (sorting == 'lowest') {
        sortField = 'price';
        sortingOrder = 'ASC';
    } else {
        sortField = 'id';
        sortingOrder = 'DESC';
    }

    if (subCategory == 'allSub') {
        qr = `select * from product where categoryName = '${category}' ORDER BY ${sortField} ${sortingOrder} limit ${limit} offset ${pageNumber}`;
        qr2 = `select count (*) from product where categoryName = '${category}'`;
    } else {
        qr = `select * from product where categoryName = '${category}' and ${subTitle} = '${subCategory}' ORDER BY ${sortField} ${sortingOrder} limit ${limit} offset ${pageNumber}`;
        qr2 = `select count (*) from product where categoryName = '${category}' and ${subTitle} = '${subCategory}'`;
    }

    db.query(qr, (err, result) => {
        db.query(qr2, (err2, result2) => {
            if (err || err2) {
                console.log('error1: ' + err + 'error2: ' + err2);
            }
    
            if (result.length > 0) {
                res.send({
                    message: 'products...',
                    data: result,
                    dataLength: result2[0]['count (*)']
                })
            } else {
                res.send({
                    data: 'no data',
                    dataLength: 0
                })
            }
        })
    })
})

// get all images
app.get('/images', (req, res) => {
    let qr = `select * from images`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        if (result.length > 0) {
            res.send({
                message: 'all images...',
                data: result
            })
        } else {
            res.send({
                data: 'no data'
            })
        }
    })
})

// get All cart
app.get('/cartsStatus/:status/:pageNumber/:limit', (req, res) => {
    let limit = req.params.limit;
    let pageNumber = req.params.pageNumber * limit;
    let cartStatus = req.params.status;
    let qr = `select * from cart  where status = '${cartStatus}' order by date desc limit ${limit} offset ${pageNumber}`;
    let qr2 = `select count (*) from cart  where status = '${cartStatus}'`

    db.query(qr, (err, result) => {
        db.query(qr2, (err2, result2) => {
            if (err || err2) {
                console.log('error: ' + err + 'error2: ' + err2);
            }
    
            if (result.length > 0) {
                res.send({
                    message: 'cart created',
                    data: result,
                    dataLength: result2[0]['count (*)']
                })
            } else {
                res.send({
                    data: [],
                    dataLength: 0
                })
            }
        }) 
    })
})

// get All count
app.get('/cartsCount/:status', (req, res) => {
    let status = req.params.status;

    let qr = `select count (*) from cart where status = '${status}'`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'cart created',
            dataLength: result[0]['count (*)']
        })
    })
})

// get single product
app.get('/allProducts/:id', (req, res) => {
    let productID = req.params.id;

    let qr = `select * from product where id = ${productID}`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        if (result.length > 0) {
            res.send({
                message: 'Single product...',
                data: result
            })
        } else {
            res.send({
                message: 'Data not found'
            })
        }
    })
})

// get single product images
app.get('/images/:id', (req, res) => {
    let productID = req.params.id;

    let qr = `select * from images where productId = ${productID}`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        if (result.length > 0) {
            res.send({
                message: 'Single product Images...',
                data: result
            })
        } else {
            res.send({
                message: 'Data not found'
            })
        }
    })
})

// get all products images
app.get('/imagesSearch/:list', (req, res) => {
    let iDs = req.params.list;

    let qr = `select * from images where productId in (${iDs})`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        if (result.length > 0) {
            res.send({
                message: 'All product Images...',
                data: result
            })
        } else {
            res.send({
                message: 'Data not found'
            })
        }
    })
})

// post single product
app.post('/allProducts', (req, res) => {
    let id = req.body.id;
    let title = req.body.title;
    let price = req.body.price;
    let priceBefore = null;
    let amount = req.body.amount;
    let description = req.body.description;
    let categoryName = req.body.category;
    let addedToCart = null;
    let brand = null;;
    let type = null;;
    let status = null;;
    let os = null;
    if (req.body.addedToCart) {
        addedToCart = req.body.addedToCart;
    }

    if (req.body.priceBefore) {
        priceBefore = req.body.priceBefore;
    }

    if (req.body.brand) {
        brand = req.body.brand;
    }

    if (req.body.type) {
        type = req.body.type;
    }

    if (req.body.status) {
        status = req.body.status;
    }

    if (req.body['o-s']) {
        os = req.body['o-s'];
    }

    let qr = `insert into product (id, title, price, priceBefore, amount, description, categoryName, addedToCart, brand, type, status, os)
                values('${id}', '${title}', '${price}', ${priceBefore}, '${amount}', '${description}', '${categoryName}', '${addedToCart}', '${brand}', '${type}', '${status}', '${os}')`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'product created...',
            data: result
        })
    })
})

// post single cart
app.post('/carts', (req, res) => {
    let client = req.body.client;
    let phone = req.body.phone;
    let address = req.body.address;
    let cartProducts = req.body.cartProducts;
    let status = req.body.status;

    let qr = `insert into cart (client, phone, address, cartProducts, status)
                values('${client}', '${phone}', '${address}', '${cartProducts}', '${status}')`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'cart created',
            data: result
        })
    })
})

// post single image
app.post('/image', (req, res) => {
    let imageUrl = req.body.imageUrl;
    let productId = req.body.productId;

    let qr = `insert into images (imageUrl, productId)
                values('${imageUrl}', '${productId}')`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'image created...',
            data: result
        })
    })
})

// post multiple images
app.post('/images/:id', (req, res) => {
    let image = req.body.image;
    let productId = req.params.id;

    let qr;

    qr = `insert into images (imageUrl, productId)
            values('${image}', '${productId}')`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'image created...'
        })
    })
})

// update single product
app.put('/allProducts/:id', (req, res) => {
    let productID = req.params.id;
    let title = req.body.title;
    let price = req.body.price;
    let priceBefore = null;
    let amount = req.body.amount;
    let description = req.body.description;
    let categoryName;
    if (req.body.category) {
        categoryName = req.body.category;
    } else if (req.body.categoryName) {
        categoryName = req.body.categoryName;
    }
    let addedToCart = null;
    let brand = null;
    let type = null;
    let status = null;
    let os = null;

    if (req.body.priceBefore) {
        priceBefore = req.body.priceBefore;
    }

    if (req.body.addedToCart) {
        addedToCart = req.body.addedToCart;
    }

    if (req.body.brand) {
        brand = `"${req.body.brand}"`;
    }

    if (req.body.type) {
        type = `"${req.body.type}"`;
    }

    if (req.body.status) {
        status = `"${req.body.status}"`;
    }

    if (req.body['o-s']) {
        os = `"${req.body['o-s']}"`;
    }

    let qr = `update product set title = "${title}",price = ${price}, priceBefore = ${priceBefore}, amount = ${amount},description = "${description}",categoryName = "${categoryName}",addedToCart = ${addedToCart},brand = ${brand},type = ${type},status = ${status},os = ${os}
    where id = ${productID}`;
    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'product updated...'
        })
    })
})

// update single image
app.put('/image/:id', (req, res) => {
    let imageID = req.params.id;

    let imageUrl = req.body.imageUrl;

    let qr = `update images set imageUrl = "${imageUrl}"
        where imageId = ${imageID}`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'image updated...'
        })
    })
})

// update cart status
app.put('/cartsUpdateStatus/:id', (req, res) => {
    let cartId = req.params.id;
    let cartStatus = req.body.cartStatus;

    let qr = `update cart set status = "${cartStatus}"
        where id = ${cartId}`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'cart updated...'
        })
    })
})

//delete image
app.delete('/image/:id', (req, res) => {
    let imageId = req.params.id;

    let qr = `delete from image
                where id = ${imageId}`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'image deleted...'
        })
    })
})

//delete product
app.delete('/allProducts/:id', (req, res) => {
    let productId = req.params.id;

    let qr = `delete from product
                where id = ${productId}`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'product deleted...'
        })
    })
})

//delete cart
app.delete('/cartsDelete/:id', (req, res) => {
    let cartId = req.params.id;

    let qr = `delete from cart
                where id = ${cartId}`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'cart deleted...'
        })
    })
})

//delete product images
app.delete('/images/:id', (req, res) => {
    let productId = req.params.id;

    let qr = `delete from images
                where productId = ${productId}`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log('error: ' + err);
        }

        res.send({
            message: 'product images deleted...'
        })
    })
})

app.listen(PORT, ()=>{

})
