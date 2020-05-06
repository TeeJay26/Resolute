const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const passport=require("passport");
const session=require("express-session");
const  passportLocalMongoose=require("passport-local-mongoose");






const app=express();




app.use(express.static("public"));
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:"secretisasecret",
    resave:false,
    saveUninitialized:false,
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


mongoose.connect("mongodb://localhost:27017/chatDB");
mongoose.set("useCreateIndex",true);


const userSchema=new mongoose.Schema({
       userName:String,
       password:String,
});

userSchema.plugin(passportLocalMongoose);

const User=mongoose.model("User",userSchema);


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const chatschema={
    message:String,
};

const groupChat=mongoose.model("groupChat",chatschema);


let grouptexts=[];






app.get("/",function(req,res){
    
    
    if(req.isAuthenticated()){
    groupChat.find({},function(err,grouptexts){
       
            res.render("home",{grouptexts:grouptexts});
    })}else{
            res.redirect("/frontpage");
        }
    })
    


app.get("/signup",function(req,res){
    res.render("signup");
})


app.get("/frontpage",function(req,res){
    

    res.render("frontpage");
})
app.post("/",function(req,res){
    
    const chat= new groupChat({
        message:req.body.message,
    });

    chat.save(function(err){
        if(!err){
            grouptexts.push(chat);
            res.redirect("/");
        }else{
            console.log(err);
            
        }
    })
});




app.post("/signup",function(req,res){
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            res.redirect("/signup")
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                
                
                res.redirect("/");
            })
        }
    })
})
app.post("/frontpage",function(req,res){
    const user =new User({
        username:req.body.userName,
        password:req.body.password,
    });
    

    req.login(user,function(err){
        
        
          passport.authenticate("local")(req,res,function(){
              
    
            res.redirect("/");
        })
    
        
   
})
})


app.listen("3000",function(){
    console.log("server is running");
})