import express from 'express';
import "dotenv/config";
import fs from 'fs';
import multer from 'multer';

function randomString(len: number) {
    return Math.random().toString(36).substring(2, len + 2);
}

const upload = multer({
    storage: multer.diskStorage({
        destination: "public/uploads",
        filename: (req, file, cb) => {
            cb(null, randomString(32) + file.originalname.substring(file.originalname.lastIndexOf('.')));
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
})

const app = express();

app.use((req, res, next) => {
    if (req.headers.authorization === process.env.API_KEY) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" })
    }
});

app.use(express.static("public"));



app.post("/api/image", upload.single("image"), (req, res) => {
    res.json({
        filename: req.file?.filename,
        link: "https://mrdiamond.is-a.dev/uploads/" + req.file?.filename
    })
});

app.delete("/api/image/:filename", (req, res) => {
    const filename = req.params.filename;
    if (!filename) {
        res.status(400).json({ error: "Filename is required" });
        return;
    }

    if (filename.includes("/") || filename.includes("\\")) {
        res.status(400).json({ error: "nice try" });
        return;
    }

    if (!fs.existsSync(`public/uploads/${filename}`)) {
        res.status(404).json({ error: "File not found" });
        return;
    }

    fs.unlink(`public/uploads/${filename}`, (err: any) => {
        if (err) {
            res.status(404).json({ error: "File not found" });
        } else {
            res.json({ message: "File deleted" });
        }
    });
});



app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});