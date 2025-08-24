const express = require('express');
const router = express.Router();
const { prisma } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// Get all transcriptions for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const transcriptions = await prisma.transcription.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        fileType: true,
        durationSeconds: true,
        status: true,
        transcriptionOutput: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: transcriptions
    });
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transcriptions'
    });
  }
});

// Get a specific transcription by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transcription = await prisma.transcription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!transcription) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found'
      });
    }

    res.json({
      success: true,
      data: transcription
    });
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transcription'
    });
  }
});

// Create a new transcription
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      fileName,
      fileSize,
      fileType,
      durationSeconds,
      transcriptionOutput,
      metadata
    } = req.body;

    const transcription = await prisma.transcription.create({
      data: {
        userId: req.user.id,
        fileName: fileName || 'Unknown file',
        fileSize: fileSize || null,
        fileType: fileType || null,
        durationSeconds: durationSeconds || null,
        status: 'completed',
        transcriptionOutput: transcriptionOutput || null,
        metadata: metadata || null
      }
    });

    res.status(201).json({
      success: true,
      data: transcription
    });
  } catch (error) {
    console.error('Error creating transcription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transcription'
    });
  }
});

// Update a transcription
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const transcription = await prisma.transcription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!transcription) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found'
      });
    }

    const updatedTranscription = await prisma.transcription.update({
      where: {
        id: req.params.id
      },
      data: req.body
    });

    res.json({
      success: true,
      data: updatedTranscription
    });
  } catch (error) {
    console.error('Error updating transcription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transcription'
    });
  }
});

// Delete a transcription
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const transcription = await prisma.transcription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!transcription) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found'
      });
    }

    await prisma.transcription.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({
      success: true,
      message: 'Transcription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transcription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transcription'
    });
  }
});

module.exports = router;
