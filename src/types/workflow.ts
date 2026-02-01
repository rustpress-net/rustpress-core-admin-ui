/**
 * RustPress Enterprise Workflow System Types
 * Comprehensive type definitions for the visual workflow builder
 */

// ============================================
// Core Workflow Types
// ============================================

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
export type NodeCategory = 'trigger' | 'action' | 'logic' | 'transform' | 'utility' | 'integration' | 'ai' | 'custom';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// ============================================
// Node Types
// ============================================

export type TriggerType =
  | 'manual'
  | 'schedule'
  | 'webhook'
  | 'event'
  | 'database_change'
  | 'file_upload'
  | 'form_submit'
  | 'api_call';

export type ActionType =
  | 'http_request'
  | 'database_query'
  | 'send_email'
  | 'send_notification'
  | 'create_content'
  | 'update_content'
  | 'delete_content'
  | 'file_operation'
  | 'run_function'
  | 'call_plugin';

export type LogicType =
  | 'if_else'
  | 'switch'
  | 'loop'
  | 'while'
  | 'parallel'
  | 'merge'
  | 'wait_all'
  | 'race';

export type TransformType =
  | 'map'
  | 'filter'
  | 'reduce'
  | 'sort'
  | 'group'
  | 'flatten'
  | 'split'
  | 'join'
  | 'template';

export type UtilityType =
  | 'delay'
  | 'retry'
  | 'error_handler'
  | 'timeout'
  | 'rate_limit'
  | 'log'
  | 'set_variable'
  | 'get_variable';

export type IntegrationType =
  | 'rustpress_api'
  | 'plugin_call'
  | 'function_call'
  | 'external_api'
  | 'database'
  | 'storage'
  | 'cache';

export type NodeType = TriggerType | ActionType | LogicType | TransformType | UtilityType | IntegrationType | 'custom_code' | 'sub_workflow' | 'start' | 'end';

// ============================================
// Node Configuration
// ============================================

export interface NodeInput {
  id: string;
  name: string;
  type: 'any' | 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  defaultValue?: any;
}

export interface NodeOutput {
  id: string;
  name: string;
  type: 'any' | 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
}

export interface NodePort {
  id: string;
  type: 'input' | 'output';
  dataType: NodeInput['type'];
  label: string;
  connected: boolean;
  multiple?: boolean; // Allow multiple connections
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  backoffType: 'fixed' | 'exponential' | 'linear';
  initialDelay: number; // milliseconds
  maxDelay: number;
  retryOn: ('error' | 'timeout' | 'specific_codes')[];
  specificCodes?: number[];
}

export interface TimeoutPolicy {
  enabled: boolean;
  duration: number; // milliseconds
  action: 'fail' | 'skip' | 'retry';
}

export interface ErrorHandling {
  onError: 'stop' | 'continue' | 'retry' | 'fallback';
  fallbackNodeId?: string;
  logError: boolean;
  notifyOnError: boolean;
  notificationChannels?: string[];
}

// ============================================
// Workflow Node
// ============================================

export interface WorkflowNodeConfig {
  // Common config
  label?: string;
  description?: string;
  disabled?: boolean;

  // Execution config
  retryPolicy?: RetryPolicy;
  timeout?: TimeoutPolicy;
  errorHandling?: ErrorHandling;

  // Type-specific config
  [key: string]: any;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  category: NodeCategory;
  position: Position;
  size?: Size;

  // Display
  name: string;
  icon: string;
  color: string;

  // Ports
  inputs: NodePort[];
  outputs: NodePort[];

  // Configuration
  config: WorkflowNodeConfig;

  // Metadata
  createdAt: string;
  updatedAt: string;

  // Runtime
  executionStatus?: ExecutionStatus;
  executionResult?: any;
  executionError?: string;
  executionDuration?: number;
}

// ============================================
// Connections
// ============================================

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;

  // Visual
  label?: string;
  color?: string;
  animated?: boolean;

  // Condition (for conditional connections)
  condition?: {
    type: 'always' | 'expression' | 'value';
    expression?: string;
    value?: any;
  };
}

// ============================================
// Workflow Definition
// ============================================

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'secret';
  value: any;
  description?: string;
  scope: 'workflow' | 'global';
  isSecret: boolean;
}

export interface WorkflowTrigger {
  type: TriggerType;
  config: {
    // Schedule trigger
    schedule?: {
      type: 'cron' | 'interval' | 'specific';
      cron?: string;
      interval?: number;
      timezone?: string;
      specificTimes?: string[];
    };
    // Webhook trigger
    webhook?: {
      path: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      authentication?: 'none' | 'api_key' | 'bearer' | 'basic';
      apiKey?: string;
    };
    // Event trigger
    event?: {
      source: string;
      eventType: string;
      filters?: Record<string, any>;
    };
    // Database trigger
    databaseChange?: {
      table: string;
      operations: ('insert' | 'update' | 'delete')[];
      conditions?: string;
    };
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;

  // Structure
  nodes: WorkflowNode[];
  connections: Connection[];

  // Trigger
  trigger: WorkflowTrigger;

  // Variables
  variables: WorkflowVariable[];

  // Settings
  settings: {
    maxExecutionTime: number;
    maxRetries: number;
    parallelExecutions: number;
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
    notifications: {
      onSuccess: boolean;
      onFailure: boolean;
      channels: string[];
    };
  };

  // Status
  status: WorkflowStatus;
  version: number;

  // Metadata
  folderId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastEditedBy: string;

  // Stats
  stats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    lastExecutedAt?: string;
  };
}

// ============================================
// Execution Types
// ============================================

export interface NodeExecutionLog {
  nodeId: string;
  nodeName: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  input?: any;
  output?: any;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  retryCount?: number;
  logs: {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
  }[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowVersion: number;

  // Trigger info
  triggeredBy: 'manual' | 'schedule' | 'webhook' | 'event' | 'api';
  triggeredAt: string;
  triggerData?: any;

  // Status
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;

  // Progress
  currentNodeId?: string;
  completedNodes: string[];

  // Results
  nodeExecutions: NodeExecutionLog[];
  output?: any;
  error?: {
    nodeId: string;
    message: string;
    stack?: string;
  };

  // Metadata
  environment: 'development' | 'staging' | 'production';
  executedBy?: string;
}

// ============================================
// Template Types
// ============================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;

  // Template content
  nodes: Omit<WorkflowNode, 'id' | 'createdAt' | 'updatedAt'>[];
  connections: Omit<Connection, 'id'>[];
  variables: Omit<WorkflowVariable, 'id'>[];

  // Metadata
  author: string;
  version: string;
  tags: string[];
  usageCount: number;
  rating: number;

  // Requirements
  requiredPlugins?: string[];
  requiredPermissions?: string[];

  // Preview
  previewImage?: string;
  documentation?: string;
}

// ============================================
// Node Registry (Available Node Types)
// ============================================

export interface NodeDefinition {
  type: NodeType;
  category: NodeCategory;
  name: string;
  description: string;
  icon: string;
  color: string;

  // Ports
  defaultInputs: Omit<NodePort, 'id' | 'connected'>[];
  defaultOutputs: Omit<NodePort, 'id' | 'connected'>[];

  // Configuration schema
  configSchema: {
    fields: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'code' | 'json' | 'expression' | 'secret';
      label: string;
      description?: string;
      required?: boolean;
      defaultValue?: any;
      options?: { label: string; value: any }[];
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
      };
    }[];
  };

  // Behavior
  allowMultipleInputs?: boolean;
  allowMultipleOutputs?: boolean;
  isStartNode?: boolean;
  isEndNode?: boolean;
}

// ============================================
// Canvas State
// ============================================

export interface CanvasState {
  zoom: number;
  pan: Position;
  selectedNodeIds: string[];
  selectedConnectionIds: string[];
  hoveredNodeId: string | null;
  hoveredConnectionId: string | null;
  hoveredPort: {
    nodeId: string;
    portId: string;
    portType: 'input' | 'output';
  } | null;
  connectingFrom: {
    nodeId: string;
    portId: string;
    portType: 'input' | 'output';
  } | null;
  isDragging: boolean;
  isSelecting: boolean;
  selectionBox: {
    start: Position;
    end: Position;
  } | null;
}

// ============================================
// UI State
// ============================================

export interface WorkflowEditorState {
  workflow: Workflow | null;
  canvas: CanvasState;

  // Panels
  isSidebarOpen: boolean;
  isPropertiesPanelOpen: boolean;
  selectedNodeForConfig: string | null;

  // History
  undoStack: Workflow[];
  redoStack: Workflow[];

  // Execution
  isExecuting: boolean;
  currentExecution: WorkflowExecution | null;
  debugMode: boolean;
  breakpoints: string[];

  // Validation
  validationErrors: {
    nodeId?: string;
    connectionId?: string;
    message: string;
    severity: 'error' | 'warning';
  }[];

  // Clipboard
  clipboard: {
    nodes: WorkflowNode[];
    connections: Connection[];
  } | null;
}

// ============================================
// API Types
// ============================================

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  folderId?: string;
  templateId?: string;
  tags?: string[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  connections?: Connection[];
  variables?: WorkflowVariable[];
  trigger?: WorkflowTrigger;
  settings?: Workflow['settings'];
  status?: WorkflowStatus;
  tags?: string[];
}

export interface ExecuteWorkflowRequest {
  workflowId: string;
  triggerData?: any;
  environment?: 'development' | 'staging' | 'production';
  debugMode?: boolean;
}

export interface WorkflowListFilters {
  status?: WorkflowStatus[];
  folderId?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastExecutedAt';
  sortOrder?: 'asc' | 'desc';
}
