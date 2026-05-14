import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

// Get all agents
export const getAgents = async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        role: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json({ status: 'OK', data: agents });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Get agent by ID
export const getAgentById = async (req, res) => {
  const { id } = req.params;
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: parseInt(id) },
      include: {
        role: true
      }
    });
    if (!agent) {
      return res.status(404).json({ status: 'ERR', message: 'Agent not found' });
    }
    res.status(200).json({ status: 'OK', data: agent });
  } catch (error) {
    console.error('Get agent by ID error:', error);
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Create new agent
export const createAgent = async (req, res) => {
  const { fullName, email, primaryPhone, secondaryPhone, address, city, roleId, status, password } = req.body;
  
  if (!fullName || !email || !primaryPhone || !roleId || !password) {
    return res.status(400).json({ status: 'ERR', message: 'Missing required fields' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAgent = await prisma.agent.create({
      data: {
        fullName,
        email,
        primaryPhone,
        secondaryPhone,
        address,
        city,
        roleId: parseInt(roleId),
        status: status || 'ACTIVE',
        password: hashedPassword
      },
      include: {
        role: true
      }
    });
    res.status(201).json({ status: 'OK', data: newAgent });
  } catch (error) {
    console.error('Create agent error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: 'ERR', message: 'Email already exists' });
    }
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Update agent
export const updateAgent = async (req, res) => {
  const { id } = req.params;
  const { fullName, email, primaryPhone, secondaryPhone, address, city, roleId, status, password } = req.body;

  try {
    const updateData = {
      fullName,
      email,
      primaryPhone,
      secondaryPhone,
      address,
      city,
      roleId: roleId ? parseInt(roleId) : undefined,
      status
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        role: true
      }
    });
    res.status(200).json({ status: 'OK', data: updatedAgent });
  } catch (error) {
    console.error('Update agent error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: 'ERR', message: 'Email already exists' });
    }
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};

// Delete agent
export const deleteAgent = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.agent.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ status: 'OK', message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ status: 'ERR', message: error.message });
  }
};
