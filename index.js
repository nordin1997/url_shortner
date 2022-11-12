require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns')
const generateUniqueId = require('generate-unique-id')
const mongoose = require('mongoose')
const mURI = process.env['MONGO_URI']
mongoose.connect(mURI,{ useNewUrlParser: true, useUnifiedTopology: true })
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.use(bodyParser.urlencoded({extended: false}))

//mongoose schema

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: {type: Number, unique: true}
})
let Url = mongoose.model('Url',urlSchema)


const url_validator = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
  if (url_validator.test(req.body.url)) {
    const uId = generateUniqueId({ length: 3, useLetters: false });
    let doc = new Url({ original_url: req.body.url, short_url: uId });
    doc.save((err, data) => { console.log('data saved successfully: ',data); console.log("err: ",err) })
    res.json({ original_url: req.body.url, short_url: uId })
  } else { res.json({ error: 'invalid url' })}})

 app.get('/api/shorturl/:short',function (req,res){
   Url.findOne({short_url:req.params.short},(err,data)=>{
     console.log(data)
     res.redirect(data['original_url']);
     console.log(err);
   })
 })


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
