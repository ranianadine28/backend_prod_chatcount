import express from 'express';
import { createFolder, getFolders, getFolderById, updateFolder, deleteFolder } from '../Controllers/dossier_controller.js';

const router = express.Router();

router.post('/create', createFolder);
router.get('/:userId', getFolders);
router.get('/:userId/:folderId', getFolderById);
router.put('/:folderId', updateFolder);
router.delete('/:folderId', deleteFolder);

export default router;
