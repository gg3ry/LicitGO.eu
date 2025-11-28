import { uploadPfp } from "../utilities/Upload";
import handleStatus from "../languages/HandleStatus";
import fs from 'fs';
import path from 'path';

export default function UploadPfpHandle(req, res, next) {
	let lang = req.headers['accept-language'] || 'EN';
	if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
		lang = 'EN';
	}

	uploadPfp.single('pfp')(req, res, function (err) {
		if (err) {
			return res.status(400).json({ message: handleStatus('1302', lang) });
		}

		if (!req.file) {
			return res.status(400).json({ message: handleStatus('1303', lang) });
		}

		const file = req.file;
		const maxBytes = 50 * 1024 * 1024;

		if (!file.mimetype || !file.mimetype.startsWith('image/')) {
			try { fs.unlinkSync(file.path); } catch (e) { }
			return res.status(400).json({ message: handleStatus('1300', lang) });
		}
		const allowedExts = new Set(['.jpeg', '.jpg', '.gif', '.png', '.webp']);
		const ext = path.extname(file.originalname || '').toLowerCase();
		if (!allowedExts.has(ext)) {
			try { fs.unlinkSync(file.path); } catch (e) { }
			return res.status(400).json({ message: handleStatus('1300', lang) });
		}

		if (file.size > maxBytes) {
			try { fs.unlinkSync(file.path); } catch (e) { }
			return res.status(400).json({ message: handleStatus('1301', lang) });
		}

		next();
	});
}

