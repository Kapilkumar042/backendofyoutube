import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)///home work learn more about names of files
    }
  })
  
export   const upload = multer({ 
    storage,
 })