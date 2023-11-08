
const isLogin = async (req,res,next)=>{
    try {
        if(req.session.user){
            req.body.name = req.session.user._id
            res.render('home',{message:"Logged in already",user:req.session.user});
        }
        else{
            req.body.name = "";
            next();
        }
    } catch (err) {
        console.log(err.message);
        res.render('error',{error:err.message});
    }
}

const isLogout = async (req,res,next)=>{
    try {
        if(req.session.user){
            console.log(req.session.user)
            req.body.name = req.session.user.fname;
            next();
        }
        else{
            req.body.name = "";
            console.log(req.body.name)
            res.render('home',{
                message:"Login or register, for a better experience.",
                user:req.body.name
            });
        }
    } catch (err) {
        console.log(err.message);
        res.render('error',{error:err.message});
    }
}


const isAdmin = async (req,res,next)=>{
    try {
        if(req.session.user.admin){
            next();
        }
        else{
            res.render('home',{message:"You are not an administrator."});
        }
    } catch (err) {
        console.log(err.message);
        res.render('error',{error:err.message});
    }
}

module.exports = {
    isLogin,
    isLogout,
    isAdmin
}