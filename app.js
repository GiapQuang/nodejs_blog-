require('dotenv').config();
const express=require('express');
const expressLayout = require('express-ejs-layouts');
const app= express();
const PORT= 5000 || process.env.PORT;
const methodOverride = require('method-override');

const connectDB= require('./server/config/db');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
  
//connect to db
connectDB();
//khoi tao middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
  }));

app.use(express.static('public'));
//template
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine', 'ejs');

app.use('/',require('./server/routes/main'));

app.listen(PORT,()=>{
    console.log(`Đã kết nối tới locallhost ${PORT}`);
});