const express = require('express')

const app = express()

const path = require("path");

const {exec} = require('child_process')

const outputFilePath = "output.pdf"

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use(express.static("public"));

var list = ""

const fs = require('fs')

const multer = require('multer')


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
  
  const imageFilter = function (req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  };
  
  var upload = multer({ storage: storage, fileFilter: imageFilter });

const PORT = process.env.PORT || 3000

var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}

app.get('/',(req,res) => {
    res.sendFile(__dirname + "/index.html")
})

app.post('/merge',upload.array('files',100),(req,res) => {
    list = ""
    if(req.files){
        req.files.forEach(file => {
            console.log(file.path)

            list+= `${file.path}`
            list+= " "
        });

        console.log(list)

        exec(`magick convert ${list} ${outputFilePath}`,(err,stdout,stderr) => {
            if(err) throw err

            res.download(outputFilePath,(err) => {
                if(err) throw err

                // delete the files which is stored

                req.files.forEach(file => {
                    fs.unlinkSync(file.path)
                });

                fs.unlinkSync(outputFilePath)
            })
        })
    }
})

app.listen(PORT,() => {
    console.log(`App is listening on Port ${PORT}`)
})
