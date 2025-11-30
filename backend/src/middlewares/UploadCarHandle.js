import { uploadCar } from "../utilities/Upload";
import handleStatus from "../languages/HandleStatus";
import fs from 'fs';
import path from 'path';

export default function UploadCarHandle(req, res, next) {
	let lang = req.headers['accept-language'] || 'EN';
	if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
		lang = 'EN';
	}
	uploadCar.array('cars', 50)(req, res, function (err) {
		if (err) {
			return res.status(400).json({ message: handleStatus('1302', lang) });
		}

		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: handleStatus('1303', lang) });
		}

		const files = req.files;
		const minFiles = 10;
		const maxFiles = 50;
		const maxBytes = 50 * 1024 * 1024;

		function cleanupAll() {
			try {
				for (const f of files) {
					if (f && f.path) fs.unlinkSync(f.path);
				}
			} catch (e) { }
		}

		if (files.length < minFiles) {
			cleanupAll();
			return res.status(400).json({ message: handleStatus('1204', lang) });
		}

		if (files.length > maxFiles) {
			cleanupAll();
			return res.status(400).json({ message: handleStatus('1205', lang) });
		}

		const allowedExts = new Set(['.jpeg', '.jpg', '.gif', '.png', '.webp']);

		for (const file of files) {
			if (!file.mimetype || !file.mimetype.startsWith('image/')) {
				cleanupAll();
				return res.status(400).json({ message: handleStatus('1300', lang) });
			}

			const ext = path.extname(file.originalname || '').toLowerCase();
			if (!allowedExts.has(ext)) {
				cleanupAll();
				return res.status(400).json({ message: handleStatus('1300', lang) });
			}

			if (file.size > maxBytes) {
				cleanupAll();
				return res.status(400).json({ message: handleStatus('1301', lang) });
			}
		}

		next();
	});
}

