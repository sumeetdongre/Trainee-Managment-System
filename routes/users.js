const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');//for password encryption
const passport = require('passport');//for authentication
// Load User model
const User = require('../models/usermodel.js');
const Marks=require('../models/marksModel');
const Feedback = require('../models/feedbackModel');
const { ensureAuthenticated,forwardNotAuthenticated } = require('../config/authfuncs.js');

router.get('/Users/home',ensureAuthenticated,(req,res)=>{

  res.render('../views/Users/home',{user:req.user});
})

//Admin login only for not authenticated people, if he is authenticated(logged in) sends him directly to his home page.
router.get('/home', forwardNotAuthenticated, (req, res) => res.redirect('/login'));

//Users Home page sends forward only if authenticated else 'ensureAuthenticated' function sends him back to index page.
router.get('/home', ensureAuthenticated, (req, res) => res.render('Users/home',{user: req.user}));

//users other than trainee can view all users
router.get('/viewUsers', ensureAuthenticated, (req, res) => {
  if(req.user.role!='trainee'){
  User.find().then(users => {
    res.render('Users/Admin/viewUsers',{Users:users});
  });
  }else{
    req.flash('error_msg','You are not authorized to view this resource');
    res.redirect('/users/home');
  }
});

//get marks
router.get('/getdetails',ensureAuthenticated,(req,res)=>
{
     Marks.find().then(data=>{
       
         res.send(data);
     }

     ).catch(err =>
        {
            res.status(500).send(" Error while retreiving data");
        });  
});

//marks details of the trainee.
// router.post('/postdetails',(req,res)=>
// {
//    const det = new Marks({
//     Name:req.body.Name,
//     Empid:req.body.Empid,
//     Batch_No:req.body.Batch_No,
//     Sql_Marks:req.body.Sql_Marks,
//     Unix_Marks:req.body.Unix_Marks,
//     Java_Marks:req.body.Java_Marks,
//     Web_Marks:req.body.Web_Marks,
//    });
   
  
//    console.log(det)
//    det.save().then(data=>
//     {

//       res.redirect('/');
        
//     }).catch(err=>
//         {
//             res.status(200).send(err);
//         });

// });
router.put('/postdetails',ensureAuthenticated,(req,res)=>
{
  
    User.findOneAndUpdate({Empid:req.body.Empid},{$set:{
      
      Name:req.body.Name,
      Empid:req.body.Empid,
      Batch_No:req.body.Batch_No,
      Sql_Marks:req.body.Sql_Marks,
      Unix_Marks:req.body.Unix_Marks,
      Java_Marks:req.body.Java_Marks,
      Web_Marks:req.body.Web_Marks,

    } }).then(data=>
    {
        if(!data)
        {
         
          req.flash(
            'error_msg',
            'User with given EmpId doesnot exist!'
          );
          res.redirect('/users/co-ordinator');
        }
        req.flash(
          'success_msg',
          'Score submitted!'
        );
        res.redirect('/users/co-ordinator');
    }).catch(err=> 
        {
          console.log(err);
          req.flash(
            'error_msg',
            'Some error occurred!'
          );
          res.redirect('/users/co-ordinator');
    });
});



//Feedback by trainee

router.post('/postFeedback',(req,res)=>
{
   const obj = new Feedback();
   obj.Name=req.body.Name;
   obj.Empid=req.body.Empid;
   obj.BC_ID=req.body.BC_ID;
   obj.Feedback=req.body.Feedback;
   obj.save().then(data=>
    {

      res.redirect('/');
        
    }).catch(err=>
        {
            res.status(200).send(err);
        });

});

//get feedback of trainee
router.get('/getFeedback',(req,res)=>
{
     Feedback.find().then(data=>{
         res.send(data);
     }

     ).catch(err =>
        {
            res.status(500).send(" Error while retreiving data");
        });  
});


//Register users
router.post('/register',ensureAuthenticated, (req,res)=>{


  //if fields are empty display error
if(!(req.body.empid||req.body.ename||req.body.batchid||req.body.email||req.body.password||req.body.phone||req.body.role)) {  
//display all errors in register page
res.render('Users/home',{user:req.user,errs:"Please enter all fields"});
  }else{
    //find if user with given empid already exists in db...if user exists send error else create new record in db
    User.findOne({ empid: req.body.empid }).then(user => {
      if (user) {
        req.flash(
          'error_msg',
          'EmpId already exists'
        );
        res.redirect('/users/home');
      }else{
        const detail = new User({
          empid: req.body.empid,
          ename: req.body.ename,
          batchid: req.body.batchid,
          email: req.body.email,
          password: req.body.password,
          phone: req.body.phone,
          role: req.body.role
        });
        //encrypting password before storing to db...salt value can be anything instead of 10
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(detail.password, salt, (err, hash) => {
            if (err) throw err;
            detail.password = hash;

            detail.save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'User now registered and can log in'
                );
                res.redirect('/users/home');
              })
              .catch(err => {
                console.log(err);
                req.flash(
                  'error_msg',
                  'Some error occurred!'
                );
                res.redirect('/users/home');
              });
          });
        });
      }
    });
  }
});


//same as above...only difference is it creates admin once account if username is 'thbs' and passwd is 'thbs123!' and also logs him in after creating
router.post('/adminAuth', (req,res,next)=>{
  if((req.body.ename=="thbs")||(req.body.password=="thbs123!")){
    req.body.empid=1;
    //if admin exists log him
    User.findOne({ empid: req.body.empid }).then(user => {
      if (user) {
        passport.authenticate('local', {
          successRedirect: '/users/home',
          failureRedirect: '/users/AdminLogin',
          failureFlash: true
        })(req, res, next); 
      }else{
      //if admin does not exist create one and then login
        const detail = new User({
          empid: 1,
          ename: req.body.ename,
          password: req.body.password,          
          role: "admin"
        });
        //passwd encryption
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(detail.password, salt, (err, hash) => {
            if (err) throw err;
            detail.password = hash;
            console.log(detail.password);
            detail.save()
              .then(user => {
                req.body.empid=1;
                passport.authenticate('local', {
                  successRedirect: '/users/home',
                  failureRedirect: '/users/AdminLogin',
                  failureFlash: true
                })(req, res, next); 
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }else{
    res.redirect('/AdminLogin')
  }
});

// Login for users
router.post('/login', (req, res, next) => {
  
    
 if(req.body.empid!=1)
 {
  passport.authenticate('local', {
    successRedirect: '/users/home',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
 }
 else{
   res.redirect('/');
 }
});
 
 

// Logout
router.get('/logout',ensureAuthenticated, (req, res) => {

  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});



//  get method to retrieve data based on empid

router.get('/register/:empid',ensureAuthenticated,(req,res)=>
{
   User.findOne({empid:req.params.empid}).then(data=>
    {
      res.render('Users/Admin/admin',{user: req.user,emp: data});
    }).catch(err =>
      {
        console.log(err);
        req.flash(
          'error_msg',
          'Some error occurred!'
        );
   
      });

});

// to delete employees based on empid

router.delete('/register/:empid',ensureAuthenticated,(req,res)=>
{
     User.findOneAndRemove({empid:req.params.empid}).then(data=>
        {
          req.flash(
            'success_msg',
            'User deleted successfully'
          );
          res.status(200).send(data);
        }).catch(err=>
            {
              console.log(err);
              req.flash(
                'error_msg',
                'Some error occurred!'
              );
            });
});


// to update employees based on empid 

router.put('/register/:empid',ensureAuthenticated,(req,res)=>
{

    User.findOneAndUpdate({empid:req.params.empid},{$set:req.body}).then(data=>
    {
        if(!data)
        {
         
          req.flash(
            'error_msg',
            'User with given EmpId does exist!'
          );
          res.redirect('/register/'+req.params.empid);
        }
        req.flash(
          'success_msg',
          'Updated Successfully!'
        );
        res.redirect('/users/home')
    }).catch(err=>
        {
          console.log(err);
          req.flash(
            'error_msg',
            'Some error occurred!'
          );
          res.redirect('/register/'+req.params.empid);
    });
});



module.exports = router;
