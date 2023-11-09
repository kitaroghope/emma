const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const con = require('./../config.json');
const session = require('express-session');
const uploadToFTP = require('../modules/ftp');

const user_route = express();

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

// user_route.use(cors({
//     origin: "https://hiweightechsystemsltd.onrender.com",
//     methods: "*",
//     allowedHeaders:"*"
// }));
var accounts = [];

user_route.use(session({
  secret: con.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Note: Change to 'true' if using HTTPS
    maxAge: 30 * 60 * 1000 // Cookie will expire in 30 minutes (in milliseconds)
  }
}));

user_route.set('view engine','ejs');
user_route.set('views','./views');
user_route.use(express.static(path.join(__dirname, '../public')));

// const storage = multer.diskStorage({
//   destination:function(req, file, cb){
//     cb(null,'uploads/')
//   },
//   filename:function(req,file,cb){
//     const n = Date.now()+'-'+file.originalname;
//     cb(null,n)
//   }
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';// 
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const n = file.originalname;
    cb(null, n);
  }
});

const upload = multer({storage:storage});
const userController = require('../controllers/userController');
const auth = require('./../middleWares/auth');

// loading landing site for store
user_route.get('/', auth.isLogout,userController.loadHome);

// loading the login and the logout
user_route.get('/login',auth.isLogin, userController.loadLogin);
user_route.post('/login', auth.isLogin, userController.login);
user_route.get('/logout', auth.isLogout, userController.logout);


// loading the register process
user_route.get('/addCustomer', auth.isLogin, userController.addCustomer);
user_route.post('/addCustomer', auth.isLogin, userController.addCustomer);
// user_route.post('/register',auth.isLogin, userController.sendMailVerify);

// add products
user_route.get('/addProduct',(req, res)=>{
  res.render('addProduct');
})
user_route.post('/addProduct', userController.addProduct)
// viewing and adding products
user_route.get('/product/:index',auth.isLogout, userController.loadProduct);
user_route.post('/student/:index',upload.any(),uploadToFTP,userController.addProduct);

// worker or admin section
user_route.get('/userManager',auth.isLogout,auth.isAdmin, userController.loadAdminPannel);
// user_route.get('/pannel',auth.isLogout,auth.isAdmin, userController.pannelLoad);
// user_route.post('/removeAdmin',auth.isLogout,auth.isAdmin,userController.removeAdmin);
user_route.post('/updateUser',auth.isLogout,auth.isAdmin,userController.updateUser);
user_route.post('/changePassword',auth.isLogout,auth.isAdmin, userController.updateUser);

// adding and removing : cart operations
user_route.post('/addToCart/:cid/:pid', auth.isLogout,userController.addToCart);
user_route.post('/removeFromCart/:cid/:pid', auth.isLogout,userController.removeFromCart);

// make order or cancle order]
user_route.get('/cart',auth.isLogout, userController.loadCart);

user_route.post('/addToCart/:id', auth.isLogout,userController.addToCart);
user_route.post('/removeFromCart/:id', auth.isLogout,userController.removeFromCart);

user_route.post('/placeOrder/:id', auth.isLogout, userController.placeOrder);

user_route.post('/upload/:folderName',upload.any(),uploadToFTP,  (req, res) => {
 try {
  res.json({message:"Uploaded successfully"})
 } catch (err) { 
  res.json({message:err.message})
 }
});

user_route.get('/keepAlive', (req, res)=>{
  console.log('Status checked, clear');
  res.send("hlo");
});

user_route.post('/op', (req, res, next)=>{
  res.json({message:"wow"});
})


module.exports = user_route;