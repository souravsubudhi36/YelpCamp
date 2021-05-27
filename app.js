var express = require('express');
var app = express();
var request = require('request');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var Camp = require('./models/campgrounds');
var Comment = require('./models/comments');
var seedDB = require('./seed.js');
var local = require('passport-local');
var user = require('./models/user'),
    passport = require('passport'),
    show = require('./support.js'),
    methodoverride=require('method-override'),
    flash = require('connect-flash');

// seedDB();

mongoose.connect('mongodb://rana:rana@ds139690.mlab.com:39690/yelp');

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended: true}));
app.use(flash());

app.use(require('express-session')({
    secret: 'ewkj ewkjc',
    resave : false,
    saveUninitialized: false
}));
app.use(methodoverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new local(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});


function isloggedin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', "Please Log in First!");

    res.redirect('/campgrounds');
}



function checkauth(req,res,next){
    if(req.isAuthenticated()){

       Camp.findById(req.params.id).populate('creator').exec(function(err, foundcamp){

        if(err){
          console.log('checkautherror')
            res.redirect('back');
        } else {
             if(foundcamp.creator.id == (req.user._id)){
            next();
        } else {
           res.redirect('back');
        }
        }
    })
    } else {
        res.redirect('back');
    }
}
function checkauthc(req,res,next){
    if(req.isAuthenticated()){
       Comment.findById(req.params.comment, function(err, foundcomment){

        if(err){
            res.redirect('back');
        } else {
             if(foundcomment.author.id.equals(req.user._id)){
            next();
        } else {
           res.redirect('back');
        }
        }
    })
    } else {
        res.redirect('back');
    }
}
app.get('/api/:id/location', (req,res)=> {
  Camp.findById(req.params.id, (err, foundcamp)=> {
    res.send(foundcamp.location);
  })
});

app.get('/',function(req,res){
    res.render('home');
});

app.get('/campgrounds',function(req,res){

    Camp.find({}).populate('creator').sort({date : -1}).exec(function(err, camps){
        if(err){
            console.log(err);
        } else {

            res.render('camps',{camps:camps});
        }
    })

});


app.post('/campgrounds',isloggedin, function(req,res){
    var qname = req.body.name;
    var qimg = req.body.image;
    var qdes = req.body.description;
    var qcreator = req.user;
    var qusername =  req.user.username;
    Camp.create({
        name: qname, url : qimg, description : qdes, creator: qcreator, username : qusername
    },function(err,newlycreated){
        if(err){
            console.log(err);
        } else {
            res.redirect('/campgrounds');
        }
    })

});





app.get('/campgrounds/:id', function(req, res){
  var edit = req.query.editm ? req.query.editm : false;
  var field = req.query.field;

    Camp.findById(req.params.id).populate('comments').populate('creator').exec(function(err, foundcamp){
        if (err){
            console.log(err);
        } else {

          if(req.user && req.user.id == foundcamp.creator.id){
            var editablem = true;

          } else {
            var editablem = false;
            edit = false;
            field = 'na';
          }

    if(req.query.edit==='true'){
        res.render('show', {foundcamp:foundcamp, editable:true, commentid : req.query.id, editablem : editablem, edit : edit, field:field});

    } else {
         res.render('show', {foundcamp:foundcamp, editable:false, editablem : editablem, edit: edit, field: field});
    }


        }
    })
});

app.put('/campgrounds/:id/:comment',checkauthc, function(req,res){
    var data = {
        text: req.body.text
    }
    Comment.findByIdAndUpdate(req.params.comment,data, function(err, foundcomment){
        if(err){
            res.redirect('/campgrounds/'+req.params.id);
        } else {
            res.redirect('/campgrounds/'+req.params.id);
        }
    })
});

app.delete('/campgrounds/:id/:comment',checkauthc, function(req,res){
    Comment.findByIdAndRemove(req.params.comment, function(err){
        res.redirect('/campgrounds/'+req.params.id);
    })
})

app.post('/campgrounds/:id/newcomment',isloggedin,  function(req,res){

    var qcom = req.body.text;
    var qa = {
        id: req.user._id,
        username: req.user.username,
        dp : req.user.dp
    }

    var obj = {text : qcom, author : qa};
    if(req.query.sub=='true'){
        obj.parentt = {id: req.query.id};
    }


    Comment.create(obj,function(err,newcomment){
        if (err){
            console.log(err);
        } else {
            Camp.findById(req.params.id, function(err, foundcamp){
                if(err){
                    console.log(err);
                } else {
                    foundcamp.comments.push(newcomment);
                    foundcamp.save();
                    res.redirect('/campgrounds/'+foundcamp._id);
                }
            })
        }
    })

});




// app.get('/campgrounds/:id/edit',checkauth, function(req,res){
//      Camp.findById(req.params.id, function(err, foundcamp){
//     res.render('editform', {campground : foundcamp });
//      });
//
// });







app.get('/profile/:id', (req,res)=> {
    var edit = req.query.edit ? req.query.edit : false;
    var field = req.query.field;
    user.findById(req.params.id).populate('liked').populate('following').exec(function(err, founduser){
        if(err){
            console.log(err)
        } else {
            var aaa = mongoose.Types.ObjectId(founduser.id);
            Camp.find({creator : aaa}).sort({date:-1}).exec(function(err,foundcamps) {
                if(err){
                  console.log("CAMP", error);
                } else {
                  if(req.user && founduser.id == req.user._id){
                      res.render('profile', {userprofile: founduser, editable: true, edit : edit, field : field, foundcamps : foundcamps})
                  } else {
                      res.render('profile', {userprofile : founduser, editable : false, edit : false, field : 'na', foundcamps:foundcamps});
                  }
                }
            });



        }
    })

    })


app.post('/profile/:id/image', (req,res)=> {
    user.findByIdAndUpdate(req.params.id, {dp : req.body.image}, (err, founduser)=> {
        if(err){
            console.log(err)
        } else {
            res.redirect('/profile/'+ req.params.id);
        }
    })
})

app.post('/profile/:id/description', (req,res)=> {
    user.findByIdAndUpdate(req.params.id, {description : req.body.description}, (err, founduser)=> {
        if(err){
            console.log(err)
        } else {
            res.redirect('/profile/'+ req.params.id);
        }
    })
})

app.post('/profile/:id/cover', (req,res)=> {
    user.findByIdAndUpdate(req.params.id, {cover : req.body.cover, address: req.body.address}, (err, founduser)=> {
        if(err){
            console.log(err)
        } else {
            res.redirect('/profile/'+ req.params.id);
        }
    })
})
app.post('/profile/:id/mobile', (req,res)=> {
    user.findByIdAndUpdate(req.params.id, {cover : req.body.cover, address: req.body.address, dp:req.body.dp, description: req.body.description}, (err, founduser)=> {
        if(err){
            console.log(err)
        } else {
            res.redirect('/profile/'+ req.params.id);
        }
    })
})

app.get('/profile/:id/like',isloggedin, (req,res)=> {
    user.findById(req.params.id, (err,founduser)=> {
        if(err){
            console.log(err)
        } else {
            var update = true;
            founduser.liked.forEach(function(usr){
                if(usr == req.user.id){
                    update = false;
                }
            })
            if(update){
                founduser.likes ++;

                founduser.liked.push(req.user);
                user.findById(req.user.id, (err, foundfollower)=>{
                    if(err){
                        console.log(err);
                    } else {
                        foundfollower.following.push(founduser);
                        foundfollower.save();
                    }
                })
                founduser.save();

                res.redirect('/profile/'+req.params.id);
            } else {
                res.redirect('/profile/'+req.params.id);
            }

            // console.log(founduser)
            // founduser.likes ++;
            // founduser.save();
            // res.redirect('/profile/'+req.params.id);

        }
    })
})


app.get('/profile/:id/unlike',isloggedin, (req,res)=> {
    user.findById(req.params.id, (err,founduser)=> {
        if(err){
            console.log(err)
        } else {
            var update = true;

            if(update){

                founduser.liked.forEach(function(follower){
                    if(follower == req.user.id){
                        founduser.liked.splice(founduser.liked.indexOf(follower),1)
                    }
                })

                user.findById(req.user.id, (err, foundfollower)=>{
                    if(err){
                        console.log(err);
                    } else {

                        foundfollower.following.forEach(function(fing){
                            if( fing == founduser.id){
                                foundfollower.following.splice(foundfollower.following.indexOf(fing),1)
                            }
                        })
                        foundfollower.save();
                    }
                })
                founduser.save();

                res.redirect('/profile/'+req.params.id);
            } else {
                res.redirect('/profile/'+req.params.id);
            }

            // console.log(founduser)
            // founduser.likes ++;
            // founduser.save();
            // res.redirect('/profile/'+req.params.id);

        }
    })
})








app.put('/campgrounds/:id',checkauth,function(req,res){
    var data = {
        name : req.body.name,
        url : req.body.image,
        description : req.body.description,
        location : {
          lat : req.body.lat,
          lng: req.body.lng
        },
        address : req.body.address
    }
    Camp.findByIdAndUpdate(req.params.id,data, function(err, foundcamp){
        if(err){
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds/'+ req.params.id);
        }

    })
});

app.delete('/campgrounds/:id',checkauth, function(req,res){
    Camp.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds');
        }
    })
});









app.post('/campgrounds/:id/supportimg', function(req,res){
    var data = req.body.images;
    var dataarray = data.split(',');
    Camp.findByIdAndUpdate(req.params.id,{supportingimages :dataarray }, (err,foundcamp)=>{

        res.redirect('/campgrounds/'+req.params.id);

    })
})



app.post('/register', function(req,res){
    user.register(new user({username: req.body.username}), req.body.password, function(err,user){
        if(err){
            console.log(err);

        }
        passport.authenticate('local')(req,res ,function(){

            res.redirect('back');
        });
    })
});

app.post('/login',passport.authenticate('local'), function(req,res){

    res.redirect('back');

});

app.get('/logout', function(req,res){
    req.logout();
    res.redirect('back');
});




app.listen(process.env.PORT || 3000);
