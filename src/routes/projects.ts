import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { 
  saveProject, 
  getProject, 
  listProjects, 
  deleteProject,
  updateProjectTitle
} from '../../controllers/projectController';

const router = Router();

// Get all projects for user (with version info)
router.get('/', authMiddleware, listProjects);

// Save or create project with versioning
router.post('/save', authMiddleware, saveProject);

// Get single project with latest version
router.get('/:projectId', authMiddleware, getProject);

// Update project title
router.put('/:projectId/title', authMiddleware, updateProjectTitle);

// Delete project and all versions
router.delete('/:projectId', authMiddleware, deleteProject);

export default router;
