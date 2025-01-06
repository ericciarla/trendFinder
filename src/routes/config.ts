import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.settings.findFirst();
    const xAccounts = await prisma.xAccount.findMany();
    const apiKeys = await prisma.apiKeys.findMany();

    res.json({
      settings,
      xAccounts,
      apiKeys
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.post('/settings', async (req, res) => {
  try {
    const { cronInterval } = req.body;
    
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: { cronInterval },
      create: { cronInterval }
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Manage X accounts
router.post('/x-accounts', async (req, res) => {
  try {
    const { username } = req.body;
    const account = await prisma.xAccount.create({
      data: { username }
    });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add X account' });
  }
});

router.delete('/x-accounts/:id', async (req, res) => {
  try {
    await prisma.xAccount.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete X account' });
  }
});

// Manage API keys
router.post('/api-keys', async (req, res) => {
  try {
    const { service, key }: { service: string; key: string } = req.body;
    const apiKey = await prisma.apiKeys.upsert({
      where: { id: (await prisma.apiKeys.findFirst({ where: { service } }))?.id ?? 0 },
      update: { key, service },
      create: { service, key }
    });
    res.json(apiKey);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

export default router; 