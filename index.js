require("dotenv").config();
const path = require("path");
const express = require("express");
const { config, engine } = require("express-edge");
const edge = require("edge.js");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Post = require("./database/models/Post");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const { ExpressOIDC } = require("@okta/oidc-middleware");
const sendMail = require('./mail')
const QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter;

//Declare Main Controllers

const homePageController = require("./controllers/homePage");
const contactPageController = require("./controllers/contactPage");
const maintPageController = require("./controllers/maintPage");

//Declare Blog Controllers
const getWhyController = require("./controllers/whyPage");
const createPostController = require("./controllers/blogHandlers/createPost");
const blogPageController = require("./controllers/blogHandlers/blogPage");
const storePostController = require("./controllers/blogHandlers/storePost");
const getPostController = require("./controllers/blogHandlers/getPost");
const getAdminController = require("./controllers/blogHandlers/getAdmin");
const handlePostController = require('./controllers/blogHandlers/handlePost');
const editPostController = require('./controllers/blogHandlers/editPost');
const submitEditController = require('./controllers/blogHandlers/submitEdit');

//Declare Project Controllers
const getAndrewController = require('./controllers/projects/getAndrew');
const getArduinoController = require('./controllers/projects/getArduino');
//const getBedController = require('./controllers/projects/getBedAndBurgers');
const getCalcController = require('./controllers/projects/getCalculator');
const getDeepTalksController = require('./controllers/projects/getDeepTalks');
//const getExcellController = require('./controllers/projects/getExcell');
const getJavaController = require('./controllers/projects/getJava');
const getMipsController = require('./controllers/projects/getMips');
const getSpaceGoblinController = require('./controllers/projects/getSpaceGoblin');
const getVBController = require('./controllers/projects/getVB');
const getRedBrickController = require('./controllers/projects/getRedBrick');
const getLruController = require('./controllers/projects/getLRU');

const app = express();
const port = 3000;


app.use(
  session({
    secret: process.env.RANDOM_SECRET_WORD,
    resave: true,
    saveUninitialized: false
  })
);


const oidc = new ExpressOIDC({
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  appBaseUrl: 'http://localhost:3000',
  scope: "openid profile",
  routes:{
    logoutCallback: { 
    }
  }
});

mongoose
  .connect("mongodb://localhost:27017/node-blog", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => "You are now connected to Mongo!")
  .catch(err => console.error("Something went wrong", err));
app.use(oidc.router);
app.use(cors());
app.use(fileUpload());
app.use(express.static(__dirname + "/public/"));
app.use(engine);
app.set("views", `${__dirname}/views`);

app.use((req, res, next) => {
  const result = req.userContext;
  edge.global('auth', result);
  next()
});

//Renders the Post from QUILL 
edge.global('parseThis', function (delta) {
  let cfg = {};
  let converter = new QuillDeltaToHtmlConverter(delta, cfg);
  let html = converter.convert(); 
  return html;
})

edge.global('stringThis', function (delta) {
  let out = JSON.stringify(delta);
  //let other = JSON.stringify(out);
  return out;
})


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

/* If I need to count documents 
app.use((req, res, next) => {
  Post.countDocuments({}, function(err, count){
    console.log( "Number of docs: ", count );

});
*/

const storePost = require("./middleware/storePost");
const { json } = require("body-parser");
app.use("/blog/posts/store", storePost);
// Database
const connection = mongoose.connection;

// Controllers

app.get("/", homePageController);
app.get("/contact", contactPageController);
app.get("/blog", blogPageController);
app.get("/blog/post/:id", getPostController);
app.get("/blog/why", getWhyController);
app.get("/blog/posts/new", oidc.ensureAuthenticated(), createPostController);
app.post("/blog/posts/store", oidc.ensureAuthenticated(), storePostController);
app.get("/admin", oidc.ensureAuthenticated(), getAdminController);
app.post("/blog/post/handle/", oidc.ensureAuthenticated(), handlePostController);
app.get("/blog/post/handle/edit", oidc.ensureAuthenticated(), editPostController);
app.post("/blog/post/handle/submit/edit", oidc.ensureAuthenticated(), submitEditController);
app.get("/maintenance", maintPageController);


//Redirects
app.get("/home", (req,res) =>{
  res.redirect('/');
});
app.get("/blog/admin", (req,res) => {
  res.redirect('/admin');
});


app.get("/andrew", getAndrewController);
app.get("/java", getJavaController);
app.get("/calculator", getCalcController);
app.get("/lruSim", getLruController); 
app.get("/redbrick", getRedBrickController);
app.get("/spacegoblin", getSpaceGoblinController);
app.get("/mips", getMipsController);
app.get("/deeptalks", getDeepTalksController);
app.get("/arduino", getArduinoController);
app.get("/visualbasic", getVBController);


app.post('/email',async (req,res) => {
  const {email,name,msg} = req.body;
  try{
    await  sendMail(email, name, msg);
    res.json({messege: 'Email Sent!'});
  }catch(e){
    res.status(500).json({messege:'Internal Error'})
  }
});
//404 Error
app.get("*", (req,res) => {
  res.sendFile(path.join(__dirname, '/public/404.html'));
});

oidc.on("ready", () => {
  app.listen(port, () => console.log(`My Blog App listening on port ${port}!`));
});
