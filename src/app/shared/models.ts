export interface SingleProduct {    
    id:number,
    title:string,
    price:number,
    priceBefore?:number,
    amount: number,
    categoryName:string,
    description:string,
    images?:[],
    addedToCart?: boolean,
    brand?: string,
    type?: string,
    os?: string,
    status?: string,
    rating?: {
        rate: number,
        count: number
    },
}

export interface CartList {
    product: SingleProduct,
    quantity:number
}