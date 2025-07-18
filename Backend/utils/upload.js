/**
 * Multer-Konfiguration für das Hochladen von Führerscheinfotos
 *
 * • Zielverzeichnis: /uploads/licenses
 * • Erlaubte Typen: JPEG und PNG
 * • Max. Dateigröße: 5 MB
 * • Dateiname: <fieldname>_<timestamp>.<ext>
 */
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Speicherort und -name
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'licenses')),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.fieldname; // licenseFront oder licenseBack
    cb(null, `${prefix}_${Date.now()}${ext}`);
  },
});

// Typprüfung (nur JPEG/PNG)
const imageFilter = (_req, file, cb) => {
  /^image\/(jpeg|png)$/i.test(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Nur JPG oder PNG erlaubt'));
};

export const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});