const multer = require('multer');
const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/images/uploaded',
    filename: (req, file, cb) => {
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check File Type
const checkFileType = (file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
}

// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 2000000},
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('image');

module.exports = upload;