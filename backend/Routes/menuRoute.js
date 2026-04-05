import express from 'express';
import { 
  createMenu, 
  getMenus, 
  getMenuById, 
  updateMenu, 
  deleteMenu,
  getPermissionMenusByRole
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/permissions/:roleId', getPermissionMenusByRole);
router.post('/', createMenu);
router.get('/', getMenus);
router.get('/:id', getMenuById);
router.patch('/:id', updateMenu);
router.delete('/:id', deleteMenu);

export default router;
