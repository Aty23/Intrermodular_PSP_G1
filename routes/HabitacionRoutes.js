const express = require('express');
const { createHabitacion, getAllHabitaciones, updateHabitacion, filterHabitaciones, deleteHabitacion, uploadImage, uploadMainImage, deleteAllImages } = require('../controllers/HabitacionController');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configurar `multer` para manejar las imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "../images");
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });
const router = express.Router();

// Rutas
router.post('/create', createHabitacion);
router.get('/getAll', getAllHabitaciones);
router.patch('/update', updateHabitacion);
router.post('/filter', filterHabitaciones);
router.post('/delete', deleteHabitacion);

router.post('/images/upload/:idHabitacion', upload.single('imagen'), uploadImage);
router.post('/images/uploadMain/:idHabitacion', upload.single('imagen'), uploadMainImage);

router.delete('/images/deleteAll/:idHabitacion', deleteAllImages);

module.exports = router;
