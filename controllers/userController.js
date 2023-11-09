const db = require('../modules/mongoDBApi');
const uploadToFTP = require('../modules/ftp');
// const sendVMail = require('../modules/sendMail');
// const bcrypt = require('bcrypt');
const fs = require('fs');
const ObjectId = require('mongodb').ObjectId;

async function getId(id){
    const objectId = new ObjectId(id);
    return objectId;
}
/*
Tables and database
dbname - ekanu_store
Tables
    -users [_id, fname, lname, number, password]
    -customers [number, fname, lname, address:[country, city, street, building]]
    -products [_id, name, details, desctription, unit, price, inventory]
    -cart [_id, number(customers), _id(product), qty, price, amount]
    -orders [_id, number(customer), products:[name, qty, unit, amount], total]
    -tracking [_id(orders), customer, address, status]
*/
var products = [];
var workers = [];
const dbname = "ekanu_store";


const loadHome = async (req, res, next)=>{
    try {
        if(products.length == 0){
            const p = await db.readRows({}, dbname, "products");
            products = p.listings;
        }
        res.render("home",{products:products, user: req.session.user});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const loadLogin = async (req, res, next)=>{
    try {
        res.render("addCustomer", {user: req.body.name});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const loadAdminPannel = async (req, res, next)=>{
    try {
        if(workers.length == 0){
            const w = await db.readRows({}, dbname, "users");
            products = w.listings;
        }
        res.render("adminPannel",{workers:workers, user:req.session.user});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const login = async (req, res, next)=>{
    try {
        const cc = await db.readRow({number:req.body.number},"ekanu_store","customers");
        if(cc.found){
            req.session.user = cc.listing;
            res.redirect('/');
        }
        else{
            res.render("error", {error:"User not found"});
        }
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const logout = async (req, res, next)=>{
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const loadProduct = async (req, res, next)=>{
    try {
        
        const index = req.params.index
        res.render("product",{product:products[index], user:req.session.user});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const addProduct = async (req, res, next)=>{
    try {
        await db.updateRow2({$and:[{img:req.body.img},{product:req.body.product}]}, req.body,"ekanu_store","products")
        products.push(req.body);
        res.json({message:"added successfully"});
    } catch (err) {
        console.log(err)
        res.render("error", {error:err.message});
    }
}

const loadCart = async (req, res, next)=>{
    try {
        const items = await db.readRows({cid:req.session.user._id},dbname,"cart");
        res.render("cart",{items:items.listings, user: req.session.user});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}

const updateProduct = async (req, res, next)=>{
    try {
        db.updateRow({product:req.body._id,},req.body,dbname,"products");
        products[index] = req.body;
        res.json({message:"product Updated"});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const deleteProduct = async (req, res, next)=>{
    try {
        const index = req.params.index;
        await db.deleteRow({_id:req.params._id}, "ekanu_store","products");
        products.splice(index, 1);
        res.json({message:"deleted successfully"});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const addCustomer = async (req, res, next)=>{
    try {
        const cc = await db.readRow({number:req.body.number},"ekanu_store","customers");
        if(cc.found){
            res.render("error", {error:"The phone number is already attached to an account."});
        }
        else{
            await db.createListing(req.body,"ekanu_store","customers");
            res.redirect('/login');
        }
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const updateCustomer = async (req, res, next)=>{
    try {
        await db.updateRow(req.body.number, req.body, dbname, "customers");
        res.json({message: "Info updated successfully"});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const deleteCustomer = async (req, res, next)=>{
    try {
        
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const addUser = async (req, res, next)=>{
    try {
        const cc = await db.readRow({number:req.body.number},"ekanu_store","customers");
        if(cc.found){
            res.render("error", {error:"User has been already added"});
        }
        else{
            await db.createListing(req.body,"ekanu_store","customers");
            res.json({message:"worker added successfully"});
        }
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const updateUser = async (req, res, next)=>{
    try {
        
    } catch (err) {
        res.render("error", {error:err.message});
    }
}
const deleteUser = async (req, res, next)=>{
    try {
        await db.deleteRow(req.body, dbname, "users");
        res.json({message: "Deleted successfully."});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}

const addToCart = async (req, res, next)=>{
    try {
        var nqty = eval(req.session.user.qty);
        const pi = await getId(req.params.pid);
        // console.log("user: "+req.params.cid+" pro: "+req.params.pid)
        const cc = await db.readRow({$and:[{cid:req.params.cid},{pid:pi}]},"ekanu_store","cart");
        if(cc.found){
            await db.updateRow(cc.listing,{qty:(cc.listing.qty + 1)}), "ekanu_store","cart";
            res.json({message: "Item is already in the cart.",nqty:nqty});
        }
        else{
            const p = await getId(req.params.pid);
            console.log(typeof p);
            const cp = await db.readRow({_id:p},dbname,"products")
            if(cp.found){
                var str = cp.listing._id;
                cp.listing.cid = req.params.cid
                cp.listing.pid = str;
                cp.listing.qty =  0;
                delete cp.listing._id;
                delete cp.listing.facilities;
                const ci = await getId(req.params.cid)

                await db.createListing(cp.listing,"ekanu_store","cart");
                await db.updateRow2({_id:ci}, {qty:nqty+1}, dbname, "customers");
                req.session.user.qty = nqty+1;
                res.json({message: "Item has been added to cart successfully",qty:req.session.user.qty});
            } else {
                res.json({message: "Item is nolonger available in store",qty:req.session.user.qty});
            }
        }
    } catch (err) {
        res.json({message: err.message+" : Error from server, try loging in",qty:req.session.user.qty});
    }
}
const removeFromCart = async (req, res, next)=>{
    try {
        var nqty = eval(req.session.user.qty);
        const pi = await getId(req.params.pid);
        const ci = await getId(req.params.cid)
        const del =  await db.deleteRow({$and:[{cid:req.params.cid},{pid:pi}]}, dbname, "cart");
        if(del > 0){
            if(nqty>0){
                nqty = nqty-1;
                await db.updateRow2({_id:ci}, {qty:nqty}, dbname, "customers");
                req.session.user.qty = nqty
            }
            req.session.user.qty = nqty
            res.json({message: "Item is deleted from cart.",qty:req.session.user.qty});
        }else{
            res.json({message: "Nothing was deleted, Item was not found in cart. please refresh",qty:req.session.user.qty});
        }
    } catch (err) {
        res.json({message: err.message,qty:req.session.user.qty});
    }
}
const placeOrder = async (req, res, next)=>{
    try {
        var items = await db.readRows({id:req.params.id},dbname,"cart");
        await db.createListing({id:req.params.id,items:items.listings, status:"Pending"}, dbname, "orders");
        await db.deleteRows({id:req.params.id},dbname,"cart");
        res.render("success",{error:"Order placed successfully"});
    } catch (err) {
        res.render("error", {error:err.message});
    }
}

module.exports = {
    loadHome,
    loadLogin,
    login,
    loadCart,
    loadAdminPannel,
    logout,
    loadProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer, 
    deleteCustomer, 
    addUser, 
    updateUser, 
    deleteUser,
    addToCart, 
    removeFromCart, 
    placeOrder
}