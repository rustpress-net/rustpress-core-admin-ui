/**
 * RustPress Workflow Store
 * State management for the visual workflow builder
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Workflow,
  WorkflowNode,
  Connection,
  WorkflowVariable,
  WorkflowExecution,
  WorkflowTemplate,
  CanvasState,
  Position,
  NodeType,
  NodeCategory,
  WorkflowStatus,
  NodeDefinition,
  WorkflowTrigger,
} from '../types/workflow';

// ============================================
// Node Registry - All available node types
// ============================================

export const nodeRegistry: NodeDefinition[] = [
  // Trigger Nodes
  {
    type: 'manual',
    category: 'trigger',
    name: 'Manual Trigger',
    description: 'Start workflow manually',
    icon: 'Play',
    color: 'from-green-500 to-emerald-600',
    defaultInputs: [],
    defaultOutputs: [{ type: 'output', dataType: 'any', label: 'Output', multiple: false }],
    configSchema: { fields: [] },
    isStartNode: true,
  },
  {
    type: 'schedule',
    category: 'trigger',
    name: 'Schedule',
    description: 'Run on a schedule (cron)',
    icon: 'Clock',
    color: 'from-blue-500 to-indigo-600',
    defaultInputs: [],
    defaultOutputs: [{ type: 'output', dataType: 'object', label: 'Trigger Data', multiple: false }],
    configSchema: {
      fields: [
        { name: 'scheduleType', type: 'select', label: 'Schedule Type', options: [
          { label: 'Cron Expression', value: 'cron' },
          { label: 'Interval', value: 'interval' },
          { label: 'Specific Times', value: 'specific' },
        ], defaultValue: 'cron' },
        { name: 'cron', type: 'string', label: 'Cron Expression', defaultValue: '0 * * * *' },
        { name: 'timezone', type: 'string', label: 'Timezone', defaultValue: 'UTC' },
      ],
    },
    isStartNode: true,
  },
  {
    type: 'webhook',
    category: 'trigger',
    name: 'Webhook',
    description: 'Trigger via HTTP webhook',
    icon: 'Webhook',
    color: 'from-purple-500 to-violet-600',
    defaultInputs: [],
    defaultOutputs: [
      { type: 'output', dataType: 'object', label: 'Headers', multiple: false },
      { type: 'output', dataType: 'object', label: 'Body', multiple: false },
      { type: 'output', dataType: 'object', label: 'Query', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'path', type: 'string', label: 'Webhook Path', required: true },
        { name: 'method', type: 'select', label: 'HTTP Method', options: [
          { label: 'POST', value: 'POST' },
          { label: 'GET', value: 'GET' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ], defaultValue: 'POST' },
        { name: 'auth', type: 'select', label: 'Authentication', options: [
          { label: 'None', value: 'none' },
          { label: 'API Key', value: 'api_key' },
          { label: 'Bearer Token', value: 'bearer' },
        ], defaultValue: 'none' },
      ],
    },
    isStartNode: true,
  },
  {
    type: 'event',
    category: 'trigger',
    name: 'Event Listener',
    description: 'Listen for system events',
    icon: 'Radio',
    color: 'from-amber-500 to-orange-600',
    defaultInputs: [],
    defaultOutputs: [{ type: 'output', dataType: 'object', label: 'Event Data', multiple: false }],
    configSchema: {
      fields: [
        { name: 'eventSource', type: 'select', label: 'Event Source', options: [
          { label: 'Content', value: 'content' },
          { label: 'User', value: 'user' },
          { label: 'Media', value: 'media' },
          { label: 'Plugin', value: 'plugin' },
          { label: 'App', value: 'app' },
        ], required: true },
        { name: 'eventType', type: 'string', label: 'Event Type', required: true },
      ],
    },
    isStartNode: true,
  },

  // Action Nodes
  {
    type: 'http_request',
    category: 'action',
    name: 'HTTP Request',
    description: 'Make an HTTP request',
    icon: 'Globe',
    color: 'from-cyan-500 to-blue-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'object', label: 'Response', multiple: false },
      { type: 'output', dataType: 'any', label: 'Error', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'url', type: 'expression', label: 'URL', required: true },
        { name: 'method', type: 'select', label: 'Method', options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'PATCH', value: 'PATCH' },
          { label: 'DELETE', value: 'DELETE' },
        ], defaultValue: 'GET' },
        { name: 'headers', type: 'json', label: 'Headers', defaultValue: {} },
        { name: 'body', type: 'json', label: 'Body' },
        { name: 'timeout', type: 'number', label: 'Timeout (ms)', defaultValue: 30000 },
      ],
    },
  },
  {
    type: 'database_query',
    category: 'action',
    name: 'Database Query',
    description: 'Execute a database query',
    icon: 'Database',
    color: 'from-slate-500 to-slate-700',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Parameters', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'array', label: 'Results', multiple: false }],
    configSchema: {
      fields: [
        { name: 'operation', type: 'select', label: 'Operation', options: [
          { label: 'Select', value: 'select' },
          { label: 'Insert', value: 'insert' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'Raw SQL', value: 'raw' },
        ], required: true },
        { name: 'table', type: 'string', label: 'Table Name' },
        { name: 'query', type: 'code', label: 'Query/Conditions' },
      ],
    },
  },
  {
    type: 'send_email',
    category: 'action',
    name: 'Send Email',
    description: 'Send an email',
    icon: 'Mail',
    color: 'from-red-500 to-pink-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Data', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'object', label: 'Result', multiple: false }],
    configSchema: {
      fields: [
        { name: 'to', type: 'expression', label: 'To', required: true },
        { name: 'subject', type: 'expression', label: 'Subject', required: true },
        { name: 'body', type: 'code', label: 'Body (HTML)' },
        { name: 'template', type: 'string', label: 'Template ID' },
      ],
    },
  },
  {
    type: 'create_content',
    category: 'action',
    name: 'Create Content',
    description: 'Create new content (post, page)',
    icon: 'FilePlus',
    color: 'from-green-500 to-teal-600',
    defaultInputs: [{ type: 'input', dataType: 'object', label: 'Content Data', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'object', label: 'Created Content', multiple: false }],
    configSchema: {
      fields: [
        { name: 'contentType', type: 'select', label: 'Content Type', options: [
          { label: 'Post', value: 'post' },
          { label: 'Page', value: 'page' },
          { label: 'Custom', value: 'custom' },
        ], required: true },
        { name: 'title', type: 'expression', label: 'Title', required: true },
        { name: 'content', type: 'expression', label: 'Content' },
        { name: 'status', type: 'select', label: 'Status', options: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
        ], defaultValue: 'draft' },
      ],
    },
  },
  {
    type: 'run_function',
    category: 'action',
    name: 'Run Function',
    description: 'Execute a RustPress function',
    icon: 'Code',
    color: 'from-violet-500 to-purple-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Arguments', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'any', label: 'Result', multiple: false }],
    configSchema: {
      fields: [
        { name: 'functionId', type: 'select', label: 'Function', required: true, options: [] },
        { name: 'arguments', type: 'json', label: 'Arguments', defaultValue: {} },
      ],
    },
  },
  {
    type: 'call_plugin',
    category: 'action',
    name: 'Call Plugin',
    description: 'Call a plugin action',
    icon: 'Puzzle',
    color: 'from-indigo-500 to-blue-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'any', label: 'Output', multiple: false }],
    configSchema: {
      fields: [
        { name: 'pluginId', type: 'select', label: 'Plugin', required: true, options: [] },
        { name: 'action', type: 'string', label: 'Action', required: true },
        { name: 'params', type: 'json', label: 'Parameters', defaultValue: {} },
      ],
    },
  },

  // Logic Nodes
  {
    type: 'if_else',
    category: 'logic',
    name: 'If/Else',
    description: 'Conditional branching',
    icon: 'GitBranch',
    color: 'from-yellow-500 to-amber-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'any', label: 'True', multiple: false },
      { type: 'output', dataType: 'any', label: 'False', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'condition', type: 'expression', label: 'Condition', required: true },
      ],
    },
  },
  {
    type: 'switch',
    category: 'logic',
    name: 'Switch',
    description: 'Multiple condition branches',
    icon: 'Split',
    color: 'from-orange-500 to-red-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'any', label: 'Case 1', multiple: false },
      { type: 'output', dataType: 'any', label: 'Case 2', multiple: false },
      { type: 'output', dataType: 'any', label: 'Default', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'expression', type: 'expression', label: 'Switch Expression', required: true },
        { name: 'cases', type: 'json', label: 'Cases', defaultValue: [] },
      ],
    },
  },
  {
    type: 'loop',
    category: 'logic',
    name: 'Loop',
    description: 'Iterate over items',
    icon: 'Repeat',
    color: 'from-teal-500 to-cyan-600',
    defaultInputs: [{ type: 'input', dataType: 'array', label: 'Items', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'any', label: 'Item', multiple: false },
      { type: 'output', dataType: 'array', label: 'All Results', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'maxIterations', type: 'number', label: 'Max Iterations', defaultValue: 100 },
        { name: 'parallel', type: 'boolean', label: 'Run in Parallel', defaultValue: false },
        { name: 'batchSize', type: 'number', label: 'Batch Size', defaultValue: 10 },
      ],
    },
  },
  {
    type: 'parallel',
    category: 'logic',
    name: 'Parallel',
    description: 'Run branches in parallel',
    icon: 'Layers',
    color: 'from-pink-500 to-rose-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'any', label: 'Branch 1', multiple: false },
      { type: 'output', dataType: 'any', label: 'Branch 2', multiple: false },
    ],
    configSchema: { fields: [] },
    allowMultipleOutputs: true,
  },
  {
    type: 'merge',
    category: 'logic',
    name: 'Merge',
    description: 'Merge multiple inputs',
    icon: 'Merge',
    color: 'from-emerald-500 to-green-600',
    defaultInputs: [
      { type: 'input', dataType: 'any', label: 'Input 1', multiple: false },
      { type: 'input', dataType: 'any', label: 'Input 2', multiple: false },
    ],
    defaultOutputs: [{ type: 'output', dataType: 'array', label: 'Merged', multiple: false }],
    configSchema: {
      fields: [
        { name: 'mergeMode', type: 'select', label: 'Merge Mode', options: [
          { label: 'Wait All', value: 'wait_all' },
          { label: 'First Completed', value: 'race' },
          { label: 'Combine', value: 'combine' },
        ], defaultValue: 'wait_all' },
      ],
    },
    allowMultipleInputs: true,
  },

  // Transform Nodes
  {
    type: 'map',
    category: 'transform',
    name: 'Map',
    description: 'Transform each item',
    icon: 'Shuffle',
    color: 'from-blue-500 to-cyan-600',
    defaultInputs: [{ type: 'input', dataType: 'array', label: 'Input', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'array', label: 'Output', multiple: false }],
    configSchema: {
      fields: [
        { name: 'expression', type: 'expression', label: 'Transform Expression', required: true },
      ],
    },
  },
  {
    type: 'filter',
    category: 'transform',
    name: 'Filter',
    description: 'Filter items by condition',
    icon: 'Filter',
    color: 'from-purple-500 to-indigo-600',
    defaultInputs: [{ type: 'input', dataType: 'array', label: 'Input', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'array', label: 'Filtered', multiple: false }],
    configSchema: {
      fields: [
        { name: 'condition', type: 'expression', label: 'Filter Condition', required: true },
      ],
    },
  },
  {
    type: 'template',
    category: 'transform',
    name: 'Template',
    description: 'Render a template',
    icon: 'FileCode',
    color: 'from-amber-500 to-yellow-600',
    defaultInputs: [{ type: 'input', dataType: 'object', label: 'Data', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'string', label: 'Output', multiple: false }],
    configSchema: {
      fields: [
        { name: 'template', type: 'code', label: 'Template', required: true },
        { name: 'engine', type: 'select', label: 'Engine', options: [
          { label: 'Handlebars', value: 'handlebars' },
          { label: 'Mustache', value: 'mustache' },
          { label: 'EJS', value: 'ejs' },
        ], defaultValue: 'handlebars' },
      ],
    },
  },

  // Utility Nodes
  {
    type: 'delay',
    category: 'utility',
    name: 'Delay',
    description: 'Wait for a duration',
    icon: 'Timer',
    color: 'from-slate-500 to-gray-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'any', label: 'Output', multiple: false }],
    configSchema: {
      fields: [
        { name: 'duration', type: 'number', label: 'Duration (ms)', required: true, defaultValue: 1000 },
      ],
    },
  },
  {
    type: 'retry',
    category: 'utility',
    name: 'Retry',
    description: 'Retry on failure',
    icon: 'RefreshCw',
    color: 'from-orange-500 to-amber-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'any', label: 'Success', multiple: false },
      { type: 'output', dataType: 'any', label: 'Failed', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'maxAttempts', type: 'number', label: 'Max Attempts', defaultValue: 3 },
        { name: 'backoffType', type: 'select', label: 'Backoff', options: [
          { label: 'Fixed', value: 'fixed' },
          { label: 'Exponential', value: 'exponential' },
          { label: 'Linear', value: 'linear' },
        ], defaultValue: 'exponential' },
        { name: 'initialDelay', type: 'number', label: 'Initial Delay (ms)', defaultValue: 1000 },
      ],
    },
  },
  {
    type: 'error_handler',
    category: 'utility',
    name: 'Error Handler',
    description: 'Handle errors gracefully',
    icon: 'ShieldAlert',
    color: 'from-red-500 to-rose-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'any', label: 'Success', multiple: false },
      { type: 'output', dataType: 'object', label: 'Error', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'onError', type: 'select', label: 'On Error', options: [
          { label: 'Continue', value: 'continue' },
          { label: 'Stop', value: 'stop' },
          { label: 'Retry', value: 'retry' },
        ], defaultValue: 'continue' },
        { name: 'logError', type: 'boolean', label: 'Log Error', defaultValue: true },
      ],
    },
  },
  {
    type: 'set_variable',
    category: 'utility',
    name: 'Set Variable',
    description: 'Set a workflow variable',
    icon: 'Variable',
    color: 'from-indigo-500 to-violet-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Value', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'any', label: 'Pass Through', multiple: false }],
    configSchema: {
      fields: [
        { name: 'variableName', type: 'string', label: 'Variable Name', required: true },
        { name: 'value', type: 'expression', label: 'Value' },
      ],
    },
  },
  {
    type: 'log',
    category: 'utility',
    name: 'Log',
    description: 'Log data for debugging',
    icon: 'FileText',
    color: 'from-gray-500 to-slate-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Data', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'any', label: 'Pass Through', multiple: false }],
    configSchema: {
      fields: [
        { name: 'level', type: 'select', label: 'Log Level', options: [
          { label: 'Info', value: 'info' },
          { label: 'Debug', value: 'debug' },
          { label: 'Warn', value: 'warn' },
          { label: 'Error', value: 'error' },
        ], defaultValue: 'info' },
        { name: 'message', type: 'expression', label: 'Message' },
      ],
    },
  },

  // Integration Nodes
  {
    type: 'rustpress_api',
    category: 'integration',
    name: 'RustPress API',
    description: 'Call RustPress internal API',
    icon: 'Server',
    color: 'from-primary-500 to-primary-700',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'any', label: 'Response', multiple: false }],
    configSchema: {
      fields: [
        { name: 'endpoint', type: 'select', label: 'API Endpoint', options: [
          { label: 'Posts', value: '/api/posts' },
          { label: 'Pages', value: '/api/pages' },
          { label: 'Media', value: '/api/media' },
          { label: 'Users', value: '/api/users' },
          { label: 'Comments', value: '/api/comments' },
          { label: 'Settings', value: '/api/settings' },
        ], required: true },
        { name: 'method', type: 'select', label: 'Method', options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ], defaultValue: 'GET' },
        { name: 'params', type: 'json', label: 'Parameters', defaultValue: {} },
      ],
    },
  },

  // ============================================
  // AI Integrations
  // Credentials managed through API Manager
  // ============================================

  // AI Text Generation
  {
    type: 'ai_text_gen',
    category: 'ai',
    name: 'AI Text Generation',
    description: 'Generate text with AI models',
    icon: 'Brain',
    color: 'from-emerald-500 to-teal-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Context', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'string', label: 'Response', multiple: false },
      { type: 'output', dataType: 'object', label: 'Full Result', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'systemPrompt', type: 'code', label: 'System Prompt', description: 'Instructions for the AI behavior' },
        { name: 'userPrompt', type: 'expression', label: 'User Prompt', required: true, description: 'The prompt to send to the AI' },
        { name: 'temperature', type: 'number', label: 'Temperature', defaultValue: 0.7, description: '0 = focused, 1 = creative' },
        { name: 'maxTokens', type: 'number', label: 'Max Tokens', defaultValue: 1000 },
        { name: 'stopSequences', type: 'json', label: 'Stop Sequences', defaultValue: [], description: 'Sequences where AI stops generating' },
      ],
    },
  },

  // AI Image Generation
  {
    type: 'ai_image_gen',
    category: 'ai',
    name: 'AI Image Generation',
    description: 'Generate images from text prompts',
    icon: 'Image',
    color: 'from-pink-500 to-rose-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Context', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'string', label: 'Image URL', multiple: false },
      { type: 'output', dataType: 'object', label: 'Full Result', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'prompt', type: 'expression', label: 'Image Prompt', required: true, description: 'Describe the image to generate' },
        { name: 'negativePrompt', type: 'expression', label: 'Negative Prompt', description: 'What to avoid in the image' },
        { name: 'size', type: 'select', label: 'Size', options: [
          { label: 'Square (1024x1024)', value: '1024x1024' },
          { label: 'Landscape (1792x1024)', value: '1792x1024' },
          { label: 'Portrait (1024x1792)', value: '1024x1792' },
        ], defaultValue: '1024x1024' },
        { name: 'quality', type: 'select', label: 'Quality', options: [
          { label: 'Standard', value: 'standard' },
          { label: 'HD', value: 'hd' },
        ], defaultValue: 'standard' },
        { name: 'style', type: 'select', label: 'Style', options: [
          { label: 'Natural', value: 'natural' },
          { label: 'Vivid', value: 'vivid' },
        ], defaultValue: 'natural' },
      ],
    },
  },

  // AI Embeddings
  {
    type: 'ai_embeddings',
    category: 'ai',
    name: 'AI Embeddings',
    description: 'Generate vector embeddings for semantic search',
    icon: 'Binary',
    color: 'from-violet-500 to-purple-600',
    defaultInputs: [{ type: 'input', dataType: 'string', label: 'Text', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'array', label: 'Embedding', multiple: false },
      { type: 'output', dataType: 'number', label: 'Dimensions', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'text', type: 'expression', label: 'Text to Embed', required: true },
        { name: 'dimensions', type: 'number', label: 'Dimensions (optional)', description: 'Reduce embedding dimensions if supported' },
      ],
    },
  },

  // AI Text Analysis
  {
    type: 'ai_analyze',
    category: 'ai',
    name: 'AI Text Analysis',
    description: 'Analyze sentiment, entities, classify text',
    icon: 'ScanText',
    color: 'from-cyan-500 to-sky-600',
    defaultInputs: [{ type: 'input', dataType: 'string', label: 'Text', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'object', label: 'Analysis', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'analysisType', type: 'select', label: 'Analysis Type', options: [
          { label: 'Sentiment Analysis', value: 'sentiment' },
          { label: 'Entity Extraction', value: 'entities' },
          { label: 'Text Classification', value: 'classify' },
          { label: 'Summarization', value: 'summarize' },
          { label: 'Key Phrases', value: 'keyphrases' },
          { label: 'Language Detection', value: 'language' },
        ], required: true },
        { name: 'text', type: 'expression', label: 'Text to Analyze', required: true },
        { name: 'categories', type: 'json', label: 'Custom Categories', description: 'For classification tasks' },
        { name: 'maxLength', type: 'number', label: 'Summary Max Length', description: 'For summarization' },
      ],
    },
  },

  // AI Chat/Conversation
  {
    type: 'ai_chat',
    category: 'ai',
    name: 'AI Chat',
    description: 'Multi-turn conversation with AI',
    icon: 'MessageSquare',
    color: 'from-green-500 to-emerald-600',
    defaultInputs: [
      { type: 'input', dataType: 'array', label: 'Message History', multiple: false },
      { type: 'input', dataType: 'string', label: 'New Message', multiple: false },
    ],
    defaultOutputs: [
      { type: 'output', dataType: 'string', label: 'AI Response', multiple: false },
      { type: 'output', dataType: 'array', label: 'Updated History', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'systemPrompt', type: 'code', label: 'System Prompt', description: 'Define AI persona and behavior' },
        { name: 'temperature', type: 'number', label: 'Temperature', defaultValue: 0.7 },
        { name: 'maxTokens', type: 'number', label: 'Max Response Tokens', defaultValue: 1000 },
        { name: 'memoryLimit', type: 'number', label: 'Messages to Keep', defaultValue: 10, description: 'Limit conversation history' },
      ],
    },
  },

  // AI Vision
  {
    type: 'ai_vision',
    category: 'ai',
    name: 'AI Vision',
    description: 'Analyze and describe images',
    icon: 'Eye',
    color: 'from-fuchsia-500 to-pink-600',
    defaultInputs: [{ type: 'input', dataType: 'string', label: 'Image URL/Base64', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'string', label: 'Description', multiple: false },
      { type: 'output', dataType: 'object', label: 'Full Analysis', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'imageUrl', type: 'expression', label: 'Image URL or Base64', required: true },
        { name: 'prompt', type: 'expression', label: 'Analysis Prompt', defaultValue: 'Describe this image in detail.', description: 'What to analyze in the image' },
        { name: 'detail', type: 'select', label: 'Detail Level', options: [
          { label: 'Auto', value: 'auto' },
          { label: 'Low', value: 'low' },
          { label: 'High', value: 'high' },
        ], defaultValue: 'auto' },
      ],
    },
  },

  // AI Speech-to-Text
  {
    type: 'ai_transcribe',
    category: 'ai',
    name: 'AI Transcription',
    description: 'Convert speech/audio to text',
    icon: 'Mic',
    color: 'from-red-500 to-orange-600',
    defaultInputs: [{ type: 'input', dataType: 'string', label: 'Audio URL/File', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'string', label: 'Transcript', multiple: false },
      { type: 'output', dataType: 'object', label: 'Full Result', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'audioUrl', type: 'expression', label: 'Audio URL or Path', required: true },
        { name: 'language', type: 'string', label: 'Language Code', description: 'ISO language code (e.g., en, es, fr)' },
        { name: 'timestamps', type: 'boolean', label: 'Include Timestamps', defaultValue: false },
        { name: 'speakerLabels', type: 'boolean', label: 'Speaker Detection', defaultValue: false },
      ],
    },
  },

  // AI Text-to-Speech
  {
    type: 'ai_tts',
    category: 'ai',
    name: 'AI Text-to-Speech',
    description: 'Convert text to natural speech',
    icon: 'Volume2',
    color: 'from-amber-500 to-yellow-600',
    defaultInputs: [{ type: 'input', dataType: 'string', label: 'Text', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'string', label: 'Audio URL', multiple: false },
      { type: 'output', dataType: 'object', label: 'Full Result', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'text', type: 'expression', label: 'Text to Speak', required: true },
        { name: 'voice', type: 'select', label: 'Voice', options: [
          { label: 'Alloy (Neutral)', value: 'alloy' },
          { label: 'Echo (Male)', value: 'echo' },
          { label: 'Fable (British)', value: 'fable' },
          { label: 'Onyx (Deep)', value: 'onyx' },
          { label: 'Nova (Female)', value: 'nova' },
          { label: 'Shimmer (Warm)', value: 'shimmer' },
        ], defaultValue: 'alloy' },
        { name: 'speed', type: 'number', label: 'Speed', defaultValue: 1.0, description: '0.25 to 4.0' },
        { name: 'format', type: 'select', label: 'Output Format', options: [
          { label: 'MP3', value: 'mp3' },
          { label: 'WAV', value: 'wav' },
          { label: 'FLAC', value: 'flac' },
        ], defaultValue: 'mp3' },
      ],
    },
  },

  // AI Content Moderation
  {
    type: 'ai_moderation',
    category: 'ai',
    name: 'AI Content Moderation',
    description: 'Check content for policy violations',
    icon: 'Sparkles',
    color: 'from-orange-500 to-amber-600',
    defaultInputs: [{ type: 'input', dataType: 'string', label: 'Content', multiple: false }],
    defaultOutputs: [
      { type: 'output', dataType: 'boolean', label: 'Is Flagged', multiple: false },
      { type: 'output', dataType: 'object', label: 'Categories', multiple: false },
    ],
    configSchema: {
      fields: [
        { name: 'content', type: 'expression', label: 'Content to Check', required: true },
        { name: 'categories', type: 'json', label: 'Categories to Check', defaultValue: ['hate', 'violence', 'sexual', 'self-harm'], description: 'Which categories to flag' },
        { name: 'threshold', type: 'number', label: 'Threshold', defaultValue: 0.5, description: 'Score threshold for flagging (0-1)' },
      ],
    },
  },

  // Custom Code Node
  {
    type: 'custom_code',
    category: 'custom',
    name: 'Custom Code',
    description: 'Execute custom JavaScript',
    icon: 'Terminal',
    color: 'from-gray-700 to-gray-900',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'any', label: 'Output', multiple: false }],
    configSchema: {
      fields: [
        { name: 'code', type: 'code', label: 'JavaScript Code', required: true },
        { name: 'async', type: 'boolean', label: 'Async Function', defaultValue: false },
      ],
    },
  },

  // Sub-workflow Node
  {
    type: 'sub_workflow',
    category: 'integration',
    name: 'Sub-Workflow',
    description: 'Execute another workflow',
    icon: 'GitFork',
    color: 'from-violet-500 to-purple-600',
    defaultInputs: [{ type: 'input', dataType: 'any', label: 'Input', multiple: false }],
    defaultOutputs: [{ type: 'output', dataType: 'any', label: 'Output', multiple: false }],
    configSchema: {
      fields: [
        { name: 'workflowId', type: 'select', label: 'Workflow', required: true, options: [] },
        { name: 'waitForCompletion', type: 'boolean', label: 'Wait for Completion', defaultValue: true },
      ],
    },
  },
];

// ============================================
// Default States
// ============================================

const defaultCanvasState: CanvasState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedNodeIds: [],
  selectedConnectionIds: [],
  hoveredNodeId: null,
  hoveredConnectionId: null,
  hoveredPort: null,
  connectingFrom: null,
  isDragging: false,
  isSelecting: false,
  selectionBox: null,
};

// ============================================
// Store Interface
// ============================================

interface WorkflowState {
  // Workflows
  workflows: Workflow[];
  currentWorkflow: Workflow | null;

  // Canvas
  canvas: CanvasState;

  // Executions
  executions: WorkflowExecution[];
  currentExecution: WorkflowExecution | null;

  // Templates
  templates: WorkflowTemplate[];

  // UI State
  isSidebarOpen: boolean;
  isPropertiesPanelOpen: boolean;
  selectedNodeForConfig: string | null;
  debugMode: boolean;
  breakpoints: string[];

  // History
  undoStack: Workflow[];
  redoStack: Workflow[];

  // Clipboard
  clipboard: { nodes: WorkflowNode[]; connections: Connection[] } | null;

  // Actions - Workflows
  createWorkflow: (name: string, description?: string) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  duplicateWorkflow: (id: string) => Workflow;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  loadWorkflow: (id: string) => void;
  saveWorkflow: () => void;

  // Actions - Nodes
  addNode: (type: NodeType, position: Position) => WorkflowNode;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  deleteSelectedNodes: () => void;
  duplicateNodes: (nodeIds: string[]) => WorkflowNode[];
  moveNode: (id: string, position: Position) => void;

  // Actions - Connections
  addConnection: (sourceNodeId: string, sourcePortId: string, targetNodeId: string, targetPortId: string) => Connection | null;
  deleteConnection: (id: string) => void;
  deleteSelectedConnections: () => void;

  // Actions - Variables
  addVariable: (variable: Omit<WorkflowVariable, 'id'>) => void;
  updateVariable: (id: string, updates: Partial<WorkflowVariable>) => void;
  deleteVariable: (id: string) => void;

  // Actions - Canvas
  setZoom: (zoom: number) => void;
  setPan: (pan: Position) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  resetView: () => void;
  selectNode: (id: string, addToSelection?: boolean) => void;
  selectNodes: (ids: string[]) => void;
  deselectAll: () => void;
  setHoveredNode: (id: string | null) => void;
  setHoveredPort: (port: { nodeId: string; portId: string; portType: 'input' | 'output' } | null) => void;
  startConnecting: (nodeId: string, portId: string, portType: 'input' | 'output') => void;
  stopConnecting: () => void;
  setDragging: (isDragging: boolean) => void;
  startSelection: (start: Position) => void;
  updateSelection: (end: Position) => void;
  endSelection: () => void;

  // Actions - UI
  toggleSidebar: () => void;
  togglePropertiesPanel: () => void;
  setSelectedNodeForConfig: (id: string | null) => void;
  toggleDebugMode: () => void;
  toggleBreakpoint: (nodeId: string) => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;

  // Actions - Clipboard
  copyNodes: () => void;
  pasteNodes: () => void;
  cutNodes: () => void;

  // Actions - Execution
  executeWorkflow: (workflowId: string, triggerData?: any) => void;
  stopExecution: (executionId: string) => void;
  setCurrentExecution: (execution: WorkflowExecution | null) => void;

  // Helpers
  getNodeDefinition: (type: NodeType) => NodeDefinition | undefined;
  validateWorkflow: () => { isValid: boolean; errors: string[] };
}

// ============================================
// Helper Functions
// ============================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createDefaultWorkflow = (name: string, description?: string): Workflow => ({
  id: generateId(),
  name,
  description: description || '',
  icon: 'Workflow',
  color: 'from-primary-500 to-accent-600',
  nodes: [],
  connections: [],
  trigger: {
    type: 'manual',
    config: {},
  },
  variables: [],
  settings: {
    maxExecutionTime: 300000, // 5 minutes
    maxRetries: 3,
    parallelExecutions: 1,
    logLevel: 'info',
    notifications: {
      onSuccess: false,
      onFailure: true,
      channels: [],
    },
  },
  status: 'draft',
  version: 1,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'current-user',
  lastEditedBy: 'current-user',
  stats: {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageDuration: 0,
  },
});

const createNode = (definition: NodeDefinition, position: Position): WorkflowNode => ({
  id: generateId(),
  type: definition.type,
  category: definition.category,
  position,
  size: { width: 200, height: 80 },
  name: definition.name,
  icon: definition.icon,
  color: definition.color,
  inputs: definition.defaultInputs.map((input, index) => ({
    ...input,
    id: `input-${index}`,
    connected: false,
  })),
  outputs: definition.defaultOutputs.map((output, index) => ({
    ...output,
    id: `output-${index}`,
    connected: false,
  })),
  config: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// ============================================
// Demo Workflows
// ============================================

const demoWorkflows: Workflow[] = [
  {
    ...createDefaultWorkflow('Welcome Email', 'Send welcome email when new user registers'),
    id: 'demo-1',
    status: 'active',
    tags: ['email', 'onboarding'],
    stats: {
      totalExecutions: 156,
      successfulExecutions: 152,
      failedExecutions: 4,
      averageDuration: 1250,
      lastExecutedAt: new Date().toISOString(),
    },
  },
  {
    ...createDefaultWorkflow('Daily Report', 'Generate and send daily analytics report'),
    id: 'demo-2',
    trigger: { type: 'schedule', config: { schedule: { type: 'cron', cron: '0 9 * * *', timezone: 'UTC' } } },
    status: 'active',
    tags: ['analytics', 'reporting'],
    stats: {
      totalExecutions: 45,
      successfulExecutions: 44,
      failedExecutions: 1,
      averageDuration: 8500,
      lastExecutedAt: new Date().toISOString(),
    },
  },
  {
    ...createDefaultWorkflow('Content Moderation', 'Auto-moderate new comments'),
    id: 'demo-3',
    trigger: { type: 'event', config: { event: { source: 'content', eventType: 'comment.created' } } },
    status: 'active',
    tags: ['moderation', 'comments'],
    stats: {
      totalExecutions: 892,
      successfulExecutions: 890,
      failedExecutions: 2,
      averageDuration: 450,
      lastExecutedAt: new Date().toISOString(),
    },
  },
  {
    ...createDefaultWorkflow('Backup Workflow', 'Weekly database backup'),
    id: 'demo-4',
    trigger: { type: 'schedule', config: { schedule: { type: 'cron', cron: '0 2 * * 0', timezone: 'UTC' } } },
    status: 'paused',
    tags: ['backup', 'maintenance'],
    stats: {
      totalExecutions: 12,
      successfulExecutions: 11,
      failedExecutions: 1,
      averageDuration: 125000,
    },
  },
];

// ============================================
// Store Implementation
// ============================================

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      // Initial State
      workflows: demoWorkflows,
      currentWorkflow: null,
      canvas: defaultCanvasState,
      executions: [],
      currentExecution: null,
      templates: [],
      isSidebarOpen: true,
      isPropertiesPanelOpen: false,
      selectedNodeForConfig: null,
      debugMode: false,
      breakpoints: [],
      undoStack: [],
      redoStack: [],
      clipboard: null,

      // Workflow Actions
      createWorkflow: (name, description) => {
        const workflow = createDefaultWorkflow(name, description);
        set((state) => ({
          workflows: [...state.workflows, workflow],
          currentWorkflow: workflow,
        }));
        return workflow;
      },

      updateWorkflow: (id, updates) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          ),
          currentWorkflow:
            state.currentWorkflow?.id === id
              ? { ...state.currentWorkflow, ...updates, updatedAt: new Date().toISOString() }
              : state.currentWorkflow,
        }));
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
          currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        }));
      },

      duplicateWorkflow: (id) => {
        const workflow = get().workflows.find((w) => w.id === id);
        if (!workflow) throw new Error('Workflow not found');
        const newWorkflow = {
          ...workflow,
          id: generateId(),
          name: `${workflow.name} (Copy)`,
          status: 'draft' as WorkflowStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageDuration: 0,
          },
        };
        set((state) => ({ workflows: [...state.workflows, newWorkflow] }));
        return newWorkflow;
      },

      setCurrentWorkflow: (workflow) => {
        set({ currentWorkflow: workflow, canvas: defaultCanvasState });
      },

      loadWorkflow: (id) => {
        const workflow = get().workflows.find((w) => w.id === id);
        if (workflow) {
          set({ currentWorkflow: workflow, canvas: defaultCanvasState });
        }
      },

      saveWorkflow: () => {
        const current = get().currentWorkflow;
        if (current) {
          get().updateWorkflow(current.id, current);
        }
      },

      // Node Actions
      addNode: (type, position) => {
        const definition = nodeRegistry.find((n) => n.type === type);
        if (!definition) throw new Error(`Node type ${type} not found`);

        const node = createNode(definition, position);
        set((state) => {
          if (!state.currentWorkflow) return state;
          get().pushToHistory();
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: [...state.currentWorkflow.nodes, node],
              updatedAt: new Date().toISOString(),
            },
          };
        });
        return node;
      },

      updateNode: (id, updates) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: state.currentWorkflow.nodes.map((n) =>
                n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      deleteNode: (id) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          get().pushToHistory();
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: state.currentWorkflow.nodes.filter((n) => n.id !== id),
              connections: state.currentWorkflow.connections.filter(
                (c) => c.sourceNodeId !== id && c.targetNodeId !== id
              ),
              updatedAt: new Date().toISOString(),
            },
            canvas: {
              ...state.canvas,
              selectedNodeIds: state.canvas.selectedNodeIds.filter((nid) => nid !== id),
            },
          };
        });
      },

      deleteSelectedNodes: () => {
        const { selectedNodeIds } = get().canvas;
        selectedNodeIds.forEach((id) => get().deleteNode(id));
      },

      duplicateNodes: (nodeIds) => {
        const currentWorkflow = get().currentWorkflow;
        if (!currentWorkflow) return [];

        const nodesToDuplicate = currentWorkflow.nodes.filter((n) => nodeIds.includes(n.id));
        const newNodes: WorkflowNode[] = nodesToDuplicate.map((node) => ({
          ...node,
          id: generateId(),
          position: { x: node.position.x + 50, y: node.position.y + 50 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        set((state) => {
          if (!state.currentWorkflow) return state;
          get().pushToHistory();
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: [...state.currentWorkflow.nodes, ...newNodes],
              updatedAt: new Date().toISOString(),
            },
            canvas: {
              ...state.canvas,
              selectedNodeIds: newNodes.map((n) => n.id),
            },
          };
        });

        return newNodes;
      },

      moveNode: (id, position) => {
        get().updateNode(id, { position });
      },

      // Connection Actions
      addConnection: (sourceNodeId, sourcePortId, targetNodeId, targetPortId) => {
        const currentWorkflow = get().currentWorkflow;
        if (!currentWorkflow) return null;

        // Prevent self-connections
        if (sourceNodeId === targetNodeId) return null;

        // Check if connection already exists
        const exists = currentWorkflow.connections.some(
          (c) =>
            c.sourceNodeId === sourceNodeId &&
            c.sourcePortId === sourcePortId &&
            c.targetNodeId === targetNodeId &&
            c.targetPortId === targetPortId
        );
        if (exists) return null;

        const connection: Connection = {
          id: generateId(),
          sourceNodeId,
          sourcePortId,
          targetNodeId,
          targetPortId,
        };

        set((state) => {
          if (!state.currentWorkflow) return state;
          get().pushToHistory();

          // Update nodes to mark ports as connected
          const updatedNodes = state.currentWorkflow.nodes.map((node) => {
            if (node.id === sourceNodeId) {
              return {
                ...node,
                outputs: node.outputs.map((port) =>
                  port.id === sourcePortId ? { ...port, connected: true } : port
                ),
              };
            }
            if (node.id === targetNodeId) {
              return {
                ...node,
                inputs: node.inputs.map((port) =>
                  port.id === targetPortId ? { ...port, connected: true } : port
                ),
              };
            }
            return node;
          });

          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: updatedNodes,
              connections: [...state.currentWorkflow.connections, connection],
              updatedAt: new Date().toISOString(),
            },
          };
        });

        return connection;
      },

      deleteConnection: (id) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          get().pushToHistory();

          // Find the connection to delete
          const connectionToDelete = state.currentWorkflow.connections.find((c) => c.id === id);
          if (!connectionToDelete) return state;

          // Check if ports have other connections before marking as disconnected
          const remainingConnections = state.currentWorkflow.connections.filter((c) => c.id !== id);
          const sourceHasOtherConnections = remainingConnections.some(
            (c) => c.sourceNodeId === connectionToDelete.sourceNodeId && c.sourcePortId === connectionToDelete.sourcePortId
          );
          const targetHasOtherConnections = remainingConnections.some(
            (c) => c.targetNodeId === connectionToDelete.targetNodeId && c.targetPortId === connectionToDelete.targetPortId
          );

          // Update nodes to mark ports as disconnected if no other connections exist
          const updatedNodes = state.currentWorkflow.nodes.map((node) => {
            if (node.id === connectionToDelete.sourceNodeId && !sourceHasOtherConnections) {
              return {
                ...node,
                outputs: node.outputs.map((port) =>
                  port.id === connectionToDelete.sourcePortId ? { ...port, connected: false } : port
                ),
              };
            }
            if (node.id === connectionToDelete.targetNodeId && !targetHasOtherConnections) {
              return {
                ...node,
                inputs: node.inputs.map((port) =>
                  port.id === connectionToDelete.targetPortId ? { ...port, connected: false } : port
                ),
              };
            }
            return node;
          });

          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: updatedNodes,
              connections: remainingConnections,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      deleteSelectedConnections: () => {
        const { selectedConnectionIds } = get().canvas;
        selectedConnectionIds.forEach((id) => get().deleteConnection(id));
      },

      // Variable Actions
      addVariable: (variable) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              variables: [...state.currentWorkflow.variables, { ...variable, id: generateId() }],
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateVariable: (id, updates) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              variables: state.currentWorkflow.variables.map((v) =>
                v.id === id ? { ...v, ...updates } : v
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      deleteVariable: (id) => {
        set((state) => {
          if (!state.currentWorkflow) return state;
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              variables: state.currentWorkflow.variables.filter((v) => v.id !== id),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      // Canvas Actions
      setZoom: (zoom) => {
        set((state) => ({ canvas: { ...state.canvas, zoom: Math.max(0.1, Math.min(2, zoom)) } }));
      },

      setPan: (pan) => {
        set((state) => ({ canvas: { ...state.canvas, pan } }));
      },

      zoomIn: () => {
        set((state) => ({ canvas: { ...state.canvas, zoom: Math.min(2, state.canvas.zoom + 0.1) } }));
      },

      zoomOut: () => {
        set((state) => ({ canvas: { ...state.canvas, zoom: Math.max(0.1, state.canvas.zoom - 0.1) } }));
      },

      fitToScreen: () => {
        // Calculate bounds and fit - simplified for now
        set((state) => ({ canvas: { ...state.canvas, zoom: 1, pan: { x: 0, y: 0 } } }));
      },

      resetView: () => {
        set((state) => ({ canvas: { ...state.canvas, zoom: 1, pan: { x: 0, y: 0 } } }));
      },

      selectNode: (id, addToSelection = false) => {
        set((state) => ({
          canvas: {
            ...state.canvas,
            selectedNodeIds: addToSelection
              ? [...state.canvas.selectedNodeIds, id]
              : [id],
          },
          selectedNodeForConfig: id,
          isPropertiesPanelOpen: true,
        }));
      },

      selectNodes: (ids) => {
        set((state) => ({ canvas: { ...state.canvas, selectedNodeIds: ids } }));
      },

      deselectAll: () => {
        set((state) => ({
          canvas: { ...state.canvas, selectedNodeIds: [], selectedConnectionIds: [] },
          selectedNodeForConfig: null,
        }));
      },

      setHoveredNode: (id) => {
        set((state) => ({ canvas: { ...state.canvas, hoveredNodeId: id } }));
      },

      setHoveredPort: (port) => {
        set((state) => ({ canvas: { ...state.canvas, hoveredPort: port } }));
      },

      startConnecting: (nodeId, portId, portType) => {
        set((state) => ({
          canvas: { ...state.canvas, connectingFrom: { nodeId, portId, portType } },
        }));
      },

      stopConnecting: () => {
        set((state) => ({ canvas: { ...state.canvas, connectingFrom: null } }));
      },

      setDragging: (isDragging) => {
        set((state) => ({ canvas: { ...state.canvas, isDragging } }));
      },

      startSelection: (start) => {
        set((state) => ({
          canvas: { ...state.canvas, isSelecting: true, selectionBox: { start, end: start } },
        }));
      },

      updateSelection: (end) => {
        set((state) => ({
          canvas: state.canvas.selectionBox
            ? { ...state.canvas, selectionBox: { ...state.canvas.selectionBox, end } }
            : state.canvas,
        }));
      },

      endSelection: () => {
        set((state) => ({ canvas: { ...state.canvas, isSelecting: false, selectionBox: null } }));
      },

      // UI Actions
      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      togglePropertiesPanel: () => {
        set((state) => ({ isPropertiesPanelOpen: !state.isPropertiesPanelOpen }));
      },

      setSelectedNodeForConfig: (id) => {
        set({ selectedNodeForConfig: id, isPropertiesPanelOpen: id !== null });
      },

      toggleDebugMode: () => {
        set((state) => ({ debugMode: !state.debugMode }));
      },

      toggleBreakpoint: (nodeId) => {
        set((state) => ({
          breakpoints: state.breakpoints.includes(nodeId)
            ? state.breakpoints.filter((id) => id !== nodeId)
            : [...state.breakpoints, nodeId],
        }));
      },

      // History Actions
      undo: () => {
        const { undoStack, currentWorkflow } = get();
        if (undoStack.length === 0) return;

        const previous = undoStack[undoStack.length - 1];
        set((state) => ({
          currentWorkflow: previous,
          undoStack: state.undoStack.slice(0, -1),
          redoStack: currentWorkflow ? [...state.redoStack, currentWorkflow] : state.redoStack,
        }));
      },

      redo: () => {
        const { redoStack, currentWorkflow } = get();
        if (redoStack.length === 0) return;

        const next = redoStack[redoStack.length - 1];
        set((state) => ({
          currentWorkflow: next,
          redoStack: state.redoStack.slice(0, -1),
          undoStack: currentWorkflow ? [...state.undoStack, currentWorkflow] : state.undoStack,
        }));
      },

      pushToHistory: () => {
        const { currentWorkflow, undoStack } = get();
        if (!currentWorkflow) return;

        set({
          undoStack: [...undoStack.slice(-49), currentWorkflow], // Keep last 50
          redoStack: [],
        });
      },

      // Clipboard Actions
      copyNodes: () => {
        const { canvas, currentWorkflow } = get();
        if (!currentWorkflow || canvas.selectedNodeIds.length === 0) return;

        const nodes = currentWorkflow.nodes.filter((n) => canvas.selectedNodeIds.includes(n.id));
        const connections = currentWorkflow.connections.filter(
          (c) =>
            canvas.selectedNodeIds.includes(c.sourceNodeId) &&
            canvas.selectedNodeIds.includes(c.targetNodeId)
        );

        set({ clipboard: { nodes, connections } });
      },

      pasteNodes: () => {
        const { clipboard, currentWorkflow } = get();
        if (!clipboard || !currentWorkflow) return;

        const idMap = new Map<string, string>();
        clipboard.nodes.forEach((n) => idMap.set(n.id, generateId()));

        const newNodes = clipboard.nodes.map((n) => ({
          ...n,
          id: idMap.get(n.id)!,
          position: { x: n.position.x + 50, y: n.position.y + 50 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const newConnections = clipboard.connections.map((c) => ({
          ...c,
          id: generateId(),
          sourceNodeId: idMap.get(c.sourceNodeId)!,
          targetNodeId: idMap.get(c.targetNodeId)!,
        }));

        set((state) => {
          if (!state.currentWorkflow) return state;
          get().pushToHistory();
          return {
            currentWorkflow: {
              ...state.currentWorkflow,
              nodes: [...state.currentWorkflow.nodes, ...newNodes],
              connections: [...state.currentWorkflow.connections, ...newConnections],
              updatedAt: new Date().toISOString(),
            },
            canvas: {
              ...state.canvas,
              selectedNodeIds: newNodes.map((n) => n.id),
            },
          };
        });
      },

      cutNodes: () => {
        get().copyNodes();
        get().deleteSelectedNodes();
      },

      // Execution Actions
      executeWorkflow: (workflowId, triggerData) => {
        const workflow = get().workflows.find((w) => w.id === workflowId);
        if (!workflow) return;

        const execution: WorkflowExecution = {
          id: generateId(),
          workflowId,
          workflowVersion: workflow.version,
          triggeredBy: 'manual',
          triggeredAt: new Date().toISOString(),
          triggerData,
          status: 'running',
          startedAt: new Date().toISOString(),
          completedNodes: [],
          nodeExecutions: [],
          environment: 'development',
        };

        set((state) => ({
          executions: [execution, ...state.executions],
          currentExecution: execution,
        }));

        // Simulate execution (would be real execution engine in production)
        setTimeout(() => {
          set((state) => ({
            executions: state.executions.map((e) =>
              e.id === execution.id
                ? { ...e, status: 'completed', completedAt: new Date().toISOString() }
                : e
            ),
            currentExecution:
              state.currentExecution?.id === execution.id
                ? { ...state.currentExecution, status: 'completed', completedAt: new Date().toISOString() }
                : state.currentExecution,
          }));
        }, 2000);
      },

      stopExecution: (executionId) => {
        set((state) => ({
          executions: state.executions.map((e) =>
            e.id === executionId ? { ...e, status: 'cancelled' } : e
          ),
          currentExecution:
            state.currentExecution?.id === executionId
              ? { ...state.currentExecution, status: 'cancelled' }
              : state.currentExecution,
        }));
      },

      setCurrentExecution: (execution) => {
        set({ currentExecution: execution });
      },

      // Helpers
      getNodeDefinition: (type) => nodeRegistry.find((n) => n.type === type),

      validateWorkflow: () => {
        const workflow = get().currentWorkflow;
        const errors: string[] = [];

        if (!workflow) {
          return { isValid: false, errors: ['No workflow loaded'] };
        }

        if (workflow.nodes.length === 0) {
          errors.push('Workflow has no nodes');
        }

        // Check for trigger node
        const hasTrigger = workflow.nodes.some((n) => n.category === 'trigger');
        if (!hasTrigger) {
          errors.push('Workflow must have at least one trigger node');
        }

        // Check for disconnected nodes
        workflow.nodes.forEach((node) => {
          if (node.category !== 'trigger') {
            const hasInput = workflow.connections.some((c) => c.targetNodeId === node.id);
            if (!hasInput) {
              errors.push(`Node "${node.name}" has no input connection`);
            }
          }
        });

        return { isValid: errors.length === 0, errors };
      },
    }),
    {
      name: 'rustpress-workflows',
      partialize: (state) => ({
        workflows: state.workflows,
        templates: state.templates,
      }),
    }
  )
);
