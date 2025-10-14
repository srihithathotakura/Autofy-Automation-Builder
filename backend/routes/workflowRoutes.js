const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

// @route   POST /api/workflows
// @desc    Create a new workflow
router.post('/', workflowController.createWorkflow);

// @route   GET /api/workflows/user/:userId
// @desc    Get all workflows for a user
router.get('/user/:userId', workflowController.getUserWorkflows);

// @route   GET /api/workflows/stats/:userId
// @desc    Get workflow statistics for a user
router.get('/stats/:userId', workflowController.getWorkflowStats);

// @route   GET /api/workflows/:id
// @desc    Get a specific workflow by ID
router.get('/:id', workflowController.getWorkflowById);

// @route   PUT /api/workflows/:id
// @desc    Update a workflow
router.put('/:id', workflowController.updateWorkflow);

// @route   DELETE /api/workflows/:id
// @desc    Delete a workflow
router.delete('/:id', workflowController.deleteWorkflow);

// @route   POST /api/workflows/:id/execute
// @desc    Execute a workflow manually
router.post('/:id/execute', workflowController.executeWorkflow);

// @route   PUT /api/workflows/:id/toggle
// @desc    Toggle workflow active status
router.put('/:id/toggle', async (req, res) => {
  try {
    const Workflow = require('../models/Workflow');
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    workflow.isActive = !workflow.isActive;
    await workflow.save();

    res.json({ 
      message: `Workflow ${workflow.isActive ? 'activated' : 'deactivated'}`,
      workflow 
    });
  } catch (err) {
    console.error('Error toggling workflow:', err);
    res.status(500).json({ error: 'Failed to toggle workflow' });
  }
});

module.exports = router;