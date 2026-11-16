import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export const directorioImagenesProducto = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../uploads/productos',
);

mkdirSync(directorioImagenesProducto, { recursive: true });

const extensionesPorTipo: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

class ImagenProductoInvalida extends Error {}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!Object.prototype.hasOwnProperty.call(extensionesPorTipo, file.mimetype)) {
      callback(new ImagenProductoInvalida('La imagen debe ser JPG, PNG o WebP.'));
      return;
    }

    callback(null, true);
  },
});

export function procesarImagenProducto(req: Request, res: Response, next: NextFunction) {
  upload.single('imagen')(req, res, (error?: unknown) => {
    if (!error) {
      if (req.file) {
        req.file.filename = `${randomUUID()}${extensionesPorTipo[req.file.mimetype]}`;
        req.body.imagen = `/uploads/productos/${req.file.filename}`;
      }
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'La imagen no puede superar los 5 MB.'
        : 'No se pudo procesar la imagen enviada.';
      res.status(status).json({ message });
      return;
    }

    if (error instanceof ImagenProductoInvalida) {
      res.status(400).json({ message: error.message });
      return;
    }

    console.error('Error al procesar la imagen del producto:', error);
    res.status(500).json({ message: 'No se pudo guardar la imagen del producto.' });
  });
}
