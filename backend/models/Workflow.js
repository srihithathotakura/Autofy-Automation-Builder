const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['trigger', 'action'], 
    required: true 
  },
  app: { 
    type: String, 
    required: true 
  },
  event: { 
    type: String, 
    required: true 
  },
  accountEmail: { 
    type: String 
  },
  config: { 
    type: Object,
    default: {} 
  }
}, { _id: false });

const ExecutionLogSchema = new mongoose.Schema({
  executedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    required: true
  },
  triggerData: Object,
  results: [{
    stepIndex: Number,
    success: Boolean,
    message: String,
    data: Object
  }],
  error: String
});

const WorkflowSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  steps: {
    type: [StepSchema],
    validate: {
      validator: function(steps) {
        return steps.length > 0;
      },
      message: 'Workflow must have at least one step'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastExecuted: {
    type: Date
  },
  executionCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  executionLogs: [ExecutionLogSchema],
  triggerType: {
    type: String,
    enum: ['manual', 'scheduled', 'event'],
    default: 'manual'
  },
  schedule: {
    enabled: Boolean,
    cronExpression: String,
    timezone: String
  }
}, { 
  timestamps: true 
});

// Calculate success rate
WorkflowSchema.virtual('successRate').get(function() {
  if (this.executionCount === 0) return 0;
  return ((this.successCount / this.executionCount) * 100).toFixed(2);
});

WorkflowSchema.set('toJSON', { virtuals: true });
WorkflowSchema.set('toObject', { virtuals: true });

WorkflowSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Workflow', WorkflowSchema);