import express from 'express';
import { getAgents, getAgentById, createAgent, updateAgent, deleteAgent } from '../controllers/AgentController.js';

const router = express.Router();

router.get('/', getAgents);
router.get('/:id', getAgentById);
router.post('/', createAgent);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);

export default router;
