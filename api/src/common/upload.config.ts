import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';

const uploadsDirectory = join(process.cwd(), 'uploads');

if (!existsSync(uploadsDirectory)) {
  mkdirSync(uploadsDirectory, { recursive: true });
}

export const imageUploadOptions = {
  storage: diskStorage({
    destination: uploadsDirectory,
    filename: (_request, file, callback) => {
      const extension = extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    _request: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

    if (!allowedTypes.has(file.mimetype)) {
      callback(new BadRequestException('La imagen debe ser JPG, PNG o WEBP.'), false);
      return;
    }

    callback(null, true);
  },
};

export function uploadedImageUrl(file?: Express.Multer.File): string {
  return file ? `/uploads/${file.filename}` : '';
}
