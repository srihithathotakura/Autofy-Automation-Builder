const Workflow = require('../models/Workflow');
const User = require('../models/User');
const { executeWorkflow } = require('../services/workflowExecutor');

// Create workflow
exports.createWorkflow = async (req, res) => {
  try {
    const { userId, name, steps } = req.body;
    
    if (!userId || !name || !steps || steps.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const workflow = new Workflow({
      userId,
      name,
      steps,
    });

    await workflow.save();
    res.status(201).json({ 
      message: 'Workflow created successfully', 
      workflow 
    });
  } catch (err) {
    console.error('Error creating workflow:', err);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
};

// Get all workflows for a user
exports.getUserWorkflows = async (req, res) => {
  try {
    const { userId } = req.params;
    const workflows = await Workflow.find({ userId })
      .sort({ createdAt: -1 })
      .select('-executionLogs');
    
    res.json(workflows);
  } catch (err) {
    console.error('Error fetching workflows:', err);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
};

// Get workflow by ID
exports.getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (err) {
    console.error('Error fetching workflow:', err);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
};

// Update workflow
exports.updateWorkflow = async (req, res) => {
  try {
    const { name, steps, isActive } = req.body;
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { name, steps, isActive },
      { new: true, runValidators: true }
    );

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({ message: 'Workflow updated successfully', workflow });
  } catch (err) {
    console.error('Error updating workflow:', err);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
};

// Delete workflow
exports.deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json({ message: 'Workflow deleted successfully' });
  } catch (err) {
    console.error('Error deleting workflow:', err);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
};

// Execute workflow
exports.executeWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const user = await User.findById(workflow.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await executeWorkflow(workflow, user);
    
    res.json({ 
      message: 'Workflow executed', 
      workflowId: workflow._id,
      result
    });
  } catch (err) {
    console.error('Error executing workflow:', err);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
};

// Get workflow statistics
exports.getWorkflowStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const workflows = await Workflow.find({ userId });
    
    const stats = {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.isActive).length,
      totalExecutions: workflows.reduce((sum, w) => sum + w.executionCount, 0),
      successfulExecutions: workflows.reduce((sum, w) => sum + w.successCount, 0),
      failedExecutions: workflows.reduce((sum, w) => sum + w.failureCount, 0),
      averageSuccessRate: workflows.length > 0 
        ? (workflows.reduce((sum, w) => sum + parseFloat(w.successRate), 0) / workflows.length).toFixed(2)
        : 0,
      recentExecutions: []
    };

    // Get recent executions
    workflows.forEach(workflow => {
      if (workflow.executionLogs && workflow.executionLogs.length > 0) {
        workflow.executionLogs.slice(-5).forEach(log => {
          stats.recentExecutions.push({
            workflowName: workflow.name,
            workflowId: workflow._id,
            executedAt: log.executedAt,
            status: log.status
          });
        });
      }
    });

    stats.recentExecutions.sort((a, b) => b.executedAt - a.executedAt);
    stats.recentExecutions = stats.recentExecutions.slice(0, 10);

    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};