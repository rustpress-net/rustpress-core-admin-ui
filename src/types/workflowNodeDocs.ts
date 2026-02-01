/**
 * Workflow Node Documentation
 * Comprehensive guides for each node type
 */

export interface NodeDocumentation {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  useCases: string[];
  configuration: ConfigField[];
  examples: NodeExample[];
  bestPractices: string[];
  commonIssues: CommonIssue[];
  relatedNodes: string[];
  videoTutorialUrl?: string;
}

export interface ConfigField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json' | 'code' | 'cron' | 'url' | 'email' | 'template' | 'expression';
  required: boolean;
  description: string;
  defaultValue?: string | number | boolean | object;
  options?: { value: string; label: string; description?: string }[];
  placeholder?: string;
  validation?: string;
  tips?: string[];
}

export interface NodeExample {
  title: string;
  description: string;
  configuration: Record<string, unknown>;
  expectedOutput?: string;
}

export interface CommonIssue {
  issue: string;
  cause: string;
  solution: string;
}

/**
 * Complete documentation for all workflow nodes
 * Node type names match exactly with workflowStore.ts nodeRegistry
 */
export const nodeDocumentation: Record<string, NodeDocumentation> = {
  // ============================================
  // TRIGGER NODES
  // ============================================

  'manual': {
    id: 'manual',
    name: 'Manual Trigger',
    category: 'Triggers',
    shortDescription: 'Start workflow manually with a button click',
    fullDescription: `The Manual Trigger node allows you to start a workflow on demand by clicking a button. This is the simplest way to test and run workflows.

It's ideal for workflows that should run on user request rather than automatically. The node has no inputs and produces an output with execution metadata.`,
    useCases: [
      'Testing workflows during development',
      'On-demand data processing tasks',
      'Manual content publishing',
      'Admin-initiated maintenance tasks',
      'One-time data migrations',
    ],
    configuration: [],
    examples: [
      {
        title: 'Basic Manual Run',
        description: 'Simply click the Run button to trigger the workflow',
        configuration: {},
        expectedOutput: '{ "timestamp": "2024-01-15T10:30:00Z", "triggeredBy": "user@example.com" }',
      },
    ],
    bestPractices: [
      'Use for testing before switching to automated triggers',
      'Add a Log node after to verify data flow',
      'Good starting point for new workflows',
    ],
    commonIssues: [
      {
        issue: 'Workflow runs but nothing happens',
        cause: 'No nodes connected to the trigger output',
        solution: 'Connect at least one node to the trigger output',
      },
    ],
    relatedNodes: ['schedule', 'webhook', 'event'],
  },

  'schedule': {
    id: 'schedule',
    name: 'Schedule',
    category: 'Triggers',
    shortDescription: 'Run workflow on a time-based schedule',
    fullDescription: `The Schedule trigger runs your workflow automatically at specified times using cron expressions, intervals, or specific times.

Perfect for recurring tasks like daily reports, regular data syncs, or periodic cleanup jobs.`,
    useCases: [
      'Daily/weekly/monthly reports',
      'Regular data backups',
      'Scheduled content publishing',
      'Periodic API data fetching',
      'Automated cleanup tasks',
    ],
    configuration: [
      {
        name: 'scheduleType',
        type: 'select',
        description: 'How to define the schedule',
        required: true,
        options: [
          { value: 'cron', label: 'Cron Expression', description: 'Most flexible scheduling option' },
          { value: 'interval', label: 'Interval', description: 'Run every X minutes/hours' },
          { value: 'specific', label: 'Specific Times', description: 'Run at exact times' },
        ],
        tips: ['Cron is most flexible, interval is simplest'],
      },
      {
        name: 'cron',
        type: 'cron',
        description: 'Cron expression (when scheduleType is cron)',
        required: false,
        defaultValue: '0 * * * *',
        placeholder: '0 9 * * *',
        tips: ['Format: minute hour day month weekday', 'Use https://crontab.guru to build expressions'],
      },
      {
        name: 'timezone',
        type: 'string',
        description: 'Timezone for the schedule',
        required: false,
        defaultValue: 'UTC',
        placeholder: 'America/New_York',
        tips: ['Use standard timezone names like America/New_York, Europe/London'],
      },
    ],
    examples: [
      {
        title: 'Daily at 9 AM',
        description: 'Run every day at 9:00 AM',
        configuration: {
          scheduleType: 'cron',
          cron: '0 9 * * *',
          timezone: 'America/New_York',
        },
        expectedOutput: '{ "scheduledTime": "2024-01-15T09:00:00-05:00", "executionId": "..." }',
      },
      {
        title: 'Every Hour',
        description: 'Run at the start of every hour',
        configuration: {
          scheduleType: 'cron',
          cron: '0 * * * *',
          timezone: 'UTC',
        },
      },
      {
        title: 'Weekly Monday Report',
        description: 'Run every Monday at 8 AM',
        configuration: {
          scheduleType: 'cron',
          cron: '0 8 * * 1',
          timezone: 'UTC',
        },
      },
      {
        title: 'Every 15 Minutes',
        description: 'Run every 15 minutes',
        configuration: {
          scheduleType: 'cron',
          cron: '*/15 * * * *',
          timezone: 'UTC',
        },
      },
    ],
    bestPractices: [
      'Always specify timezone for consistent execution',
      'Test cron expressions with online validators like crontab.guru',
      'Consider server load when scheduling multiple workflows',
      'Use meaningful intervals (avoid every minute unless necessary)',
      'Document why a specific schedule was chosen',
    ],
    commonIssues: [
      {
        issue: 'Workflow not running at expected time',
        cause: 'Timezone mismatch between configuration and expectations',
        solution: 'Verify timezone setting matches your local timezone. UTC is recommended for consistency.',
      },
      {
        issue: 'Invalid cron expression error',
        cause: 'Incorrect cron syntax or invalid values',
        solution: 'Use a cron expression validator like crontab.guru to check syntax. Remember: minute (0-59), hour (0-23), day (1-31), month (1-12), weekday (0-6).',
      },
      {
        issue: 'Workflow runs too frequently',
        cause: 'Cron expression is more frequent than intended',
        solution: 'Review the cron expression. "* * * * *" runs every minute. Use "0 * * * *" for hourly.',
      },
    ],
    relatedNodes: ['manual', 'webhook', 'delay'],
  },

  'webhook': {
    id: 'webhook',
    name: 'Webhook',
    category: 'Triggers',
    shortDescription: 'Trigger workflow via HTTP request',
    fullDescription: `The Webhook trigger creates an HTTP endpoint that starts the workflow when called. External services can POST data to this endpoint to trigger your workflow.

Ideal for integrations with third-party services, GitHub webhooks, payment processors, and any external system that can make HTTP requests.

The workflow receives the request headers, body, and query parameters as separate outputs.`,
    useCases: [
      'GitHub/GitLab webhook integrations for CI/CD',
      'Payment processor callbacks (Stripe, PayPal)',
      'Form submission processing',
      'External API integrations',
      'IoT device data ingestion',
      'Slack/Discord bot commands',
    ],
    configuration: [
      {
        name: 'path',
        type: 'string',
        description: 'The URL path for the webhook endpoint',
        required: true,
        placeholder: '/webhooks/my-integration',
        tips: ['Use a unique, descriptive path', 'Avoid special characters', 'Example: /webhooks/github-push'],
      },
      {
        name: 'method',
        type: 'select',
        description: 'HTTP method to accept',
        required: true,
        defaultValue: 'POST',
        options: [
          { value: 'POST', label: 'POST', description: 'Most common for webhooks' },
          { value: 'GET', label: 'GET', description: 'For simple triggers with query params' },
          { value: 'PUT', label: 'PUT', description: 'For update operations' },
          { value: 'DELETE', label: 'DELETE', description: 'For deletion triggers' },
        ],
      },
      {
        name: 'auth',
        type: 'select',
        description: 'Authentication method to secure the webhook',
        required: false,
        defaultValue: 'none',
        options: [
          { value: 'none', label: 'None', description: 'No authentication (not recommended for production)' },
          { value: 'api_key', label: 'API Key', description: 'Require X-API-Key header' },
          { value: 'bearer', label: 'Bearer Token', description: 'Require Authorization: Bearer token' },
        ],
        tips: ['Always use authentication in production for security'],
      },
    ],
    examples: [
      {
        title: 'GitHub Push Webhook',
        description: 'Receive GitHub push events to trigger deployment',
        configuration: {
          path: '/webhooks/github-push',
          method: 'POST',
          auth: 'none',
        },
        expectedOutput: '{ "headers": { "x-github-event": "push" }, "body": { "ref": "refs/heads/main", "commits": [...] }, "query": {} }',
      },
      {
        title: 'Stripe Payment Webhook',
        description: 'Receive Stripe payment notifications securely',
        configuration: {
          path: '/webhooks/stripe',
          method: 'POST',
          auth: 'bearer',
        },
        expectedOutput: '{ "headers": {...}, "body": { "type": "payment_intent.succeeded", "data": {...} }, "query": {} }',
      },
      {
        title: 'Form Submission',
        description: 'Receive form data from your website',
        configuration: {
          path: '/webhooks/contact-form',
          method: 'POST',
          auth: 'api_key',
        },
      },
    ],
    bestPractices: [
      'Always use HTTPS in production environments',
      'Implement authentication for all webhooks that handle sensitive data',
      'Validate and sanitize incoming data before processing',
      'Return appropriate HTTP status codes (200 for success, 400 for bad request)',
      'Log webhook requests for debugging and auditing',
      'Implement idempotency to handle duplicate webhook deliveries',
    ],
    commonIssues: [
      {
        issue: 'Webhook not receiving requests',
        cause: 'Incorrect URL, firewall blocking, or path mismatch',
        solution: 'Verify the full webhook URL is correct. Test with curl: curl -X POST https://your-domain.com/webhooks/path',
      },
      {
        issue: '401 Authentication failed',
        cause: 'Missing or incorrect API key/token',
        solution: 'Check that the external service is sending the correct authentication header. For API Key, use X-API-Key header. For Bearer, use Authorization: Bearer <token>',
      },
      {
        issue: 'Request body is empty',
        cause: 'Content-Type header missing or incorrect',
        solution: 'Ensure the request includes Content-Type: application/json header for JSON payloads',
      },
    ],
    relatedNodes: ['http_request', 'if_else', 'log'],
  },

  'event': {
    id: 'event',
    name: 'Event Listener',
    category: 'Triggers',
    shortDescription: 'Listen for internal system events',
    fullDescription: `The Event Listener trigger responds to internal RustPress events like content creation, user actions, media uploads, or plugin events.

Use this to build reactive workflows that automatically respond to what's happening in your CMS. Events are categorized by source (content, user, media, plugin, app).`,
    useCases: [
      'Auto-publish to social media when content is published',
      'Send welcome emails when users register',
      'Update search index when content changes',
      'Trigger backups when media is uploaded',
      'Log user activity for security auditing',
      'Notify admins when plugins are installed',
    ],
    configuration: [
      {
        name: 'eventSource',
        type: 'select',
        description: 'Category of events to listen for',
        required: true,
        options: [
          { value: 'content', label: 'Content', description: 'Posts, pages, custom content events' },
          { value: 'user', label: 'User', description: 'Registration, login, profile updates' },
          { value: 'media', label: 'Media', description: 'File uploads, deletions, updates' },
          { value: 'plugin', label: 'Plugin', description: 'Plugin install, activate, deactivate' },
          { value: 'app', label: 'App', description: 'Application-level events' },
        ],
      },
      {
        name: 'eventType',
        type: 'string',
        description: 'Specific event type to listen for',
        required: true,
        placeholder: 'published',
        tips: [
          'Content events: created, updated, deleted, published, unpublished',
          'User events: created, updated, deleted, login, logout',
          'Media events: uploaded, deleted, updated',
        ],
      },
    ],
    examples: [
      {
        title: 'Post Published',
        description: 'Trigger when any post is published',
        configuration: {
          eventSource: 'content',
          eventType: 'published',
        },
        expectedOutput: '{ "event": "content.published", "data": { "id": "post-123", "title": "My Post", "author": {...} } }',
      },
      {
        title: 'User Registration',
        description: 'Trigger when a new user signs up',
        configuration: {
          eventSource: 'user',
          eventType: 'created',
        },
        expectedOutput: '{ "event": "user.created", "data": { "id": "user-456", "email": "new@user.com", "name": "John" } }',
      },
      {
        title: 'Media Upload',
        description: 'Trigger when a file is uploaded',
        configuration: {
          eventSource: 'media',
          eventType: 'uploaded',
        },
      },
      {
        title: 'Plugin Installed',
        description: 'Trigger when a plugin is installed',
        configuration: {
          eventSource: 'plugin',
          eventType: 'installed',
        },
      },
    ],
    bestPractices: [
      'Be specific with event types to avoid unnecessary workflow triggers',
      'Use If/Else nodes to filter events further based on data',
      'Consider event frequency to avoid performance issues',
      'Document which events trigger which workflows',
      'Test with actual events, not just manually',
    ],
    commonIssues: [
      {
        issue: 'Event not triggering the workflow',
        cause: 'Event type name mismatch or event source incorrect',
        solution: 'Verify the exact event type name. Check the RustPress documentation for available events.',
      },
      {
        issue: 'Workflow triggers too often',
        cause: 'Event type is too broad',
        solution: 'Use more specific event types or add If/Else conditions to filter',
      },
    ],
    relatedNodes: ['if_else', 'send_email', 'http_request', 'create_content'],
  },

  // ============================================
  // ACTION NODES
  // ============================================

  'http_request': {
    id: 'http_request',
    name: 'HTTP Request',
    category: 'Actions',
    shortDescription: 'Make HTTP requests to external APIs',
    fullDescription: `The HTTP Request node allows you to call any HTTP API. Configure the URL, method, headers, and body to interact with external services.

Supports all standard HTTP methods (GET, POST, PUT, PATCH, DELETE) and can handle JSON, form data, and custom content types. The response includes status code, headers, and body.`,
    useCases: [
      'Fetch data from external REST APIs',
      'Send data to third-party services',
      'Integrate with any web service',
      'Trigger external webhooks',
      'Download files or content',
      'Connect to microservices',
    ],
    configuration: [
      {
        name: 'url',
        type: 'expression',
        description: 'The full URL to request (supports dynamic expressions)',
        required: true,
        placeholder: 'https://api.example.com/users/{{input.userId}}',
        tips: ['Use {{input.field}} for dynamic values', 'Include https:// prefix'],
      },
      {
        name: 'method',
        type: 'select',
        description: 'HTTP method to use',
        required: true,
        defaultValue: 'GET',
        options: [
          { value: 'GET', label: 'GET', description: 'Retrieve data' },
          { value: 'POST', label: 'POST', description: 'Create new data' },
          { value: 'PUT', label: 'PUT', description: 'Replace existing data' },
          { value: 'PATCH', label: 'PATCH', description: 'Update partial data' },
          { value: 'DELETE', label: 'DELETE', description: 'Remove data' },
        ],
      },
      {
        name: 'headers',
        type: 'json',
        description: 'Request headers as JSON object',
        required: false,
        defaultValue: {},
        placeholder: '{ "Authorization": "Bearer token", "Content-Type": "application/json" }',
        tips: ['Common headers: Authorization, Content-Type, Accept', 'Use secrets for API keys'],
      },
      {
        name: 'body',
        type: 'json',
        description: 'Request body for POST, PUT, PATCH methods',
        required: false,
        tips: ['Only used for POST, PUT, PATCH methods', 'Supports expressions: {{input.data}}'],
      },
      {
        name: 'timeout',
        type: 'number',
        description: 'Request timeout in milliseconds',
        required: false,
        defaultValue: 30000,
        tips: ['30000ms = 30 seconds', 'Increase for slow APIs'],
      },
    ],
    examples: [
      {
        title: 'GET Request with Auth',
        description: 'Fetch user data from an API with authentication',
        configuration: {
          url: 'https://api.example.com/users',
          method: 'GET',
          headers: { 'Authorization': 'Bearer {{secrets.API_TOKEN}}' },
          timeout: 30000,
        },
        expectedOutput: '{ "status": 200, "data": { "users": [...] }, "headers": { "content-type": "application/json" } }',
      },
      {
        title: 'POST with JSON Body',
        description: 'Create a new resource via API',
        configuration: {
          url: 'https://api.example.com/posts',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{secrets.API_TOKEN}}' },
          body: { title: '{{input.title}}', content: '{{input.content}}', author: '{{input.authorId}}' },
        },
        expectedOutput: '{ "status": 201, "data": { "id": "new-post-id", "title": "..." } }',
      },
      {
        title: 'Slack Notification',
        description: 'Send a message to Slack webhook',
        configuration: {
          url: '{{secrets.SLACK_WEBHOOK_URL}}',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { text: 'New content published: {{input.title}}' },
        },
      },
    ],
    bestPractices: [
      'Store API keys and tokens in secrets/environment variables',
      'Set appropriate timeouts for slow APIs (increase for file downloads)',
      'Always handle errors with Error Handler or If/Else nodes',
      'Log requests for debugging using Log node',
      'Use Retry node for unreliable external APIs',
      'Validate response status codes before using data',
    ],
    commonIssues: [
      {
        issue: 'Request timeout error',
        cause: 'API taking too long to respond or network issues',
        solution: 'Increase the timeout value. Check if the API is available. Verify network connectivity.',
      },
      {
        issue: '401 Unauthorized error',
        cause: 'Invalid, expired, or missing authentication',
        solution: 'Verify API key/token is correct and not expired. Check the Authorization header format.',
      },
      {
        issue: '400 Bad Request error',
        cause: 'Invalid request body or parameters',
        solution: 'Validate the request body matches API expectations. Check Content-Type header.',
      },
      {
        issue: 'CORS error',
        cause: 'Browser-based request to API without CORS headers',
        solution: 'This node runs server-side, not in browser. If still seeing CORS, check API configuration.',
      },
    ],
    relatedNodes: ['if_else', 'retry', 'error_handler', 'template'],
  },

  'database_query': {
    id: 'database_query',
    name: 'Database Query',
    category: 'Actions',
    shortDescription: 'Execute database queries directly',
    fullDescription: `The Database Query node allows you to interact directly with the RustPress database. Execute SELECT, INSERT, UPDATE, DELETE operations or run raw SQL queries.

Use this for advanced data operations that aren't covered by the standard CMS API, such as complex joins, aggregations, or bulk operations.

⚠️ Warning: Direct database access is powerful but dangerous. Always validate inputs and test queries carefully.`,
    useCases: [
      'Complex data queries with joins',
      'Bulk data updates or insertions',
      'Custom analytics and reports',
      'Data migrations between tables',
      'Performance-optimized operations',
      'Direct database maintenance',
    ],
    configuration: [
      {
        name: 'operation',
        type: 'select',
        description: 'Type of database operation to perform',
        required: true,
        options: [
          { value: 'select', label: 'Select', description: 'Query data from tables' },
          { value: 'insert', label: 'Insert', description: 'Add new records' },
          { value: 'update', label: 'Update', description: 'Modify existing records' },
          { value: 'delete', label: 'Delete', description: 'Remove records' },
          { value: 'raw', label: 'Raw SQL', description: 'Execute any SQL query' },
        ],
      },
      {
        name: 'table',
        type: 'string',
        description: 'Database table name (for non-raw operations)',
        required: false,
        placeholder: 'posts',
        tips: ['Use actual database table names', 'Common tables: posts, users, media, comments'],
      },
      {
        name: 'query',
        type: 'code',
        description: 'SQL conditions, values, or complete raw query',
        required: true,
        placeholder: 'WHERE status = "published" ORDER BY created_at DESC LIMIT 10',
        tips: ['For SELECT: use WHERE, ORDER BY, LIMIT clauses', 'For raw: write complete SQL statement', 'Use parameterized queries for security'],
      },
    ],
    examples: [
      {
        title: 'Select Recent Posts',
        description: 'Fetch the 10 most recent published posts',
        configuration: {
          operation: 'select',
          table: 'posts',
          query: 'WHERE status = "published" ORDER BY created_at DESC LIMIT 10',
        },
        expectedOutput: '[{ "id": "...", "title": "...", "created_at": "..." }, ...]',
      },
      {
        title: 'Update Post Status',
        description: 'Archive old posts',
        configuration: {
          operation: 'update',
          table: 'posts',
          query: 'SET status = "archived" WHERE created_at < "2023-01-01"',
        },
        expectedOutput: '{ "affectedRows": 42 }',
      },
      {
        title: 'Raw SQL Query',
        description: 'Complex query with joins',
        configuration: {
          operation: 'raw',
          query: 'SELECT p.*, u.name as author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE p.status = "published"',
        },
      },
      {
        title: 'Insert New Record',
        description: 'Create a new log entry',
        configuration: {
          operation: 'insert',
          table: 'activity_logs',
          query: '(user_id, action, timestamp) VALUES ("{{input.userId}}", "{{input.action}}", NOW())',
        },
      },
    ],
    bestPractices: [
      'ALWAYS use parameterized queries to prevent SQL injection',
      'Test queries in a development environment first',
      'Use LIMIT to prevent large result sets',
      'Back up data before running UPDATE or DELETE operations',
      'Use transactions for multiple related operations',
      'Add appropriate indexes for frequently queried columns',
    ],
    commonIssues: [
      {
        issue: 'Query returns empty results',
        cause: 'Conditions too restrictive or wrong table name',
        solution: 'Verify table name is correct. Test conditions individually. Check data exists.',
      },
      {
        issue: 'Permission denied error',
        cause: 'Database user lacks required permissions',
        solution: 'Check database user permissions. Contact administrator for access.',
      },
      {
        issue: 'Syntax error in query',
        cause: 'Invalid SQL syntax',
        solution: 'Check SQL syntax carefully. Test query in a database client first.',
      },
    ],
    relatedNodes: ['if_else', 'loop', 'error_handler', 'log'],
  },

  'send_email': {
    id: 'send_email',
    name: 'Send Email',
    category: 'Actions',
    shortDescription: 'Send emails programmatically',
    fullDescription: `The Send Email node sends emails using your configured email service (SMTP, SendGrid, etc.). Supports HTML content, templates, and dynamic data.

Perfect for notifications, alerts, newsletters, and automated communications. Use templates for consistent branding.`,
    useCases: [
      'Welcome emails for new users',
      'Order confirmation emails',
      'Password reset notifications',
      'Content notification alerts',
      'Newsletter distribution',
      'Error/alert notifications',
    ],
    configuration: [
      {
        name: 'to',
        type: 'expression',
        description: 'Recipient email address(es)',
        required: true,
        placeholder: '{{input.user.email}}',
        tips: ['Use expressions for dynamic recipients', 'For multiple: separate with commas or use array'],
      },
      {
        name: 'subject',
        type: 'expression',
        description: 'Email subject line',
        required: true,
        placeholder: 'Welcome to {{appName}}, {{input.user.name}}!',
        tips: ['Keep subjects concise', 'Use personalization for better open rates'],
      },
      {
        name: 'body',
        type: 'code',
        description: 'Email body content (HTML supported)',
        required: false,
        placeholder: '<h1>Welcome!</h1><p>Hello {{input.user.name}}</p>',
        tips: ['HTML is supported for rich formatting', 'Use inline CSS for best compatibility'],
      },
      {
        name: 'template',
        type: 'string',
        description: 'Email template ID (use instead of body)',
        required: false,
        placeholder: 'welcome-email',
        tips: ['Templates override the body field', 'Create templates in Email Settings'],
      },
    ],
    examples: [
      {
        title: 'Welcome Email',
        description: 'Send welcome email to new user',
        configuration: {
          to: '{{input.user.email}}',
          subject: 'Welcome to Our Platform, {{input.user.name}}!',
          body: '<h1>Welcome!</h1><p>Hello {{input.user.name}},</p><p>Thanks for joining us. Get started by exploring our features.</p>',
        },
        expectedOutput: '{ "success": true, "messageId": "msg-123" }',
      },
      {
        title: 'Order Confirmation',
        description: 'Send order confirmation with template',
        configuration: {
          to: '{{input.customer.email}}',
          subject: 'Order #{{input.orderId}} Confirmed',
          template: 'order-confirmation',
        },
      },
      {
        title: 'Admin Alert',
        description: 'Notify admin of important event',
        configuration: {
          to: 'admin@company.com',
          subject: 'Alert: {{input.alertType}}',
          body: '<p>An alert was triggered:</p><pre>{{JSON.stringify(input, null, 2)}}</pre>',
        },
      },
    ],
    bestPractices: [
      'Use templates for consistent branding and easier maintenance',
      'Test emails with different email clients (Gmail, Outlook, etc.)',
      'Include unsubscribe links for marketing emails (required by law)',
      'Validate email addresses before sending',
      'Handle bounces and delivery failures gracefully',
      'Keep subject lines under 50 characters for best display',
    ],
    commonIssues: [
      {
        issue: 'Email not delivered',
        cause: 'Invalid recipient, spam filter, or email service issue',
        solution: 'Verify email address is valid. Check spam folder. Review email service logs.',
      },
      {
        issue: 'Template not found error',
        cause: 'Template ID does not exist',
        solution: 'Verify the template ID is correct. Create the template in Email Settings.',
      },
      {
        issue: 'HTML not rendering',
        cause: 'Email client blocking HTML or CSS issues',
        solution: 'Use inline CSS. Test with different email clients. Provide plain text fallback.',
      },
    ],
    relatedNodes: ['template', 'if_else', 'event', 'loop'],
  },

  'create_content': {
    id: 'create_content',
    name: 'Create Content',
    category: 'Actions',
    shortDescription: 'Create new posts, pages, or custom content',
    fullDescription: `The Create Content node creates new content items in RustPress. Automate content creation from external data sources, APIs, or other workflows.

Supports posts, pages, and custom content types with full control over metadata, status, and taxonomy.`,
    useCases: [
      'Auto-create posts from RSS feeds',
      'Generate content from external APIs',
      'Migrate content from other systems',
      'Create placeholder content',
      'Automated content generation with AI',
      'Import data as content',
    ],
    configuration: [
      {
        name: 'contentType',
        type: 'select',
        description: 'Type of content to create',
        required: true,
        options: [
          { value: 'post', label: 'Post', description: 'Blog posts and articles' },
          { value: 'page', label: 'Page', description: 'Static pages' },
          { value: 'custom', label: 'Custom', description: 'Custom content type' },
        ],
      },
      {
        name: 'title',
        type: 'expression',
        description: 'Content title',
        required: true,
        placeholder: '{{input.title}}',
      },
      {
        name: 'content',
        type: 'expression',
        description: 'Main content body (HTML or Markdown)',
        required: false,
        placeholder: '{{input.body}}',
      },
      {
        name: 'status',
        type: 'select',
        description: 'Publication status',
        required: false,
        defaultValue: 'draft',
        options: [
          { value: 'draft', label: 'Draft', description: 'Save as draft for review' },
          { value: 'published', label: 'Published', description: 'Publish immediately' },
        ],
        tips: ['Use draft for review workflow', 'Publish for immediate visibility'],
      },
    ],
    examples: [
      {
        title: 'Create Draft Post',
        description: 'Create a new blog post as draft',
        configuration: {
          contentType: 'post',
          title: '{{input.title}}',
          content: '{{input.body}}',
          status: 'draft',
        },
        expectedOutput: '{ "id": "post-123", "title": "My Post", "status": "draft", "url": "/posts/my-post" }',
      },
      {
        title: 'Create and Publish',
        description: 'Create and immediately publish content',
        configuration: {
          contentType: 'post',
          title: 'Breaking: {{input.headline}}',
          content: '{{input.article}}',
          status: 'published',
        },
      },
      {
        title: 'Create Static Page',
        description: 'Create a new static page',
        configuration: {
          contentType: 'page',
          title: '{{input.pageName}}',
          content: '{{input.pageContent}}',
          status: 'published',
        },
      },
    ],
    bestPractices: [
      'Create as draft first, then review and publish',
      'Validate content before creating (check for empty fields)',
      'Include proper metadata (categories, tags) for organization',
      'Handle duplicate title scenarios gracefully',
      'Log created content IDs for reference',
    ],
    commonIssues: [
      {
        issue: 'Content not created',
        cause: 'Missing required fields or validation errors',
        solution: 'Ensure title and content type are provided. Check for validation errors in logs.',
      },
      {
        issue: 'Duplicate content error',
        cause: 'Content with same slug already exists',
        solution: 'Add unique identifier to title or handle duplicate error.',
      },
    ],
    relatedNodes: ['template', 'http_request', 'if_else', 'event'],
  },

  'run_function': {
    id: 'run_function',
    name: 'Run Function',
    category: 'Actions',
    shortDescription: 'Execute a RustPress serverless function',
    fullDescription: `The Run Function node executes RustPress serverless functions within your workflow. This allows you to leverage existing function logic and extend workflows with custom code.

Functions are isolated, reusable pieces of code that can perform complex operations, interact with external services, or process data in ways not covered by standard nodes.`,
    useCases: [
      'Execute custom business logic',
      'Reuse existing function code across workflows',
      'Complex data transformations',
      'External service integrations with custom handling',
      'AI/ML model inference',
      'Image/video processing',
    ],
    configuration: [
      {
        name: 'functionId',
        type: 'select',
        description: 'The function to execute',
        required: true,
        tips: ['Select from deployed functions', 'Function must be deployed and active'],
      },
      {
        name: 'arguments',
        type: 'json',
        description: 'Arguments to pass to the function',
        required: false,
        defaultValue: {},
        placeholder: '{ "imageUrl": "{{input.url}}", "width": 800 }',
        tips: ['Use expressions for dynamic values: {{input.field}}', 'Must match function parameter expectations'],
      },
    ],
    examples: [
      {
        title: 'Image Processing',
        description: 'Resize an uploaded image',
        configuration: {
          functionId: 'image-resize',
          arguments: {
            imageUrl: '{{input.imageUrl}}',
            width: 800,
            height: 600,
            format: 'webp',
          },
        },
        expectedOutput: '{ "url": "https://.../resized-image.webp", "size": 45000 }',
      },
      {
        title: 'AI Text Analysis',
        description: 'Analyze text sentiment using AI function',
        configuration: {
          functionId: 'analyze-sentiment',
          arguments: {
            text: '{{input.content}}',
            language: 'en',
          },
        },
        expectedOutput: '{ "sentiment": "positive", "score": 0.85, "keywords": [...] }',
      },
      {
        title: 'Data Enrichment',
        description: 'Enrich user data from external source',
        configuration: {
          functionId: 'enrich-contact',
          arguments: {
            email: '{{input.email}}',
          },
        },
      },
    ],
    bestPractices: [
      'Keep functions focused on single responsibilities',
      'Handle function errors with Error Handler node',
      'Document function inputs and outputs clearly',
      'Consider function timeout limits for long operations',
      'Test functions independently before using in workflows',
    ],
    commonIssues: [
      {
        issue: 'Function not found error',
        cause: 'Function not deployed or ID incorrect',
        solution: 'Verify the function is deployed and the ID matches. Check Functions page.',
      },
      {
        issue: 'Function timeout',
        cause: 'Function execution exceeds time limit',
        solution: 'Optimize function code or increase function timeout limit.',
      },
      {
        issue: 'Invalid arguments error',
        cause: 'Arguments dont match function expectations',
        solution: 'Check function documentation for expected parameter types and names.',
      },
    ],
    relatedNodes: ['custom_code', 'http_request', 'error_handler'],
  },

  'call_plugin': {
    id: 'call_plugin',
    name: 'Call Plugin',
    category: 'Actions',
    shortDescription: 'Invoke plugin actions',
    fullDescription: `The Call Plugin node allows you to invoke actions exposed by installed RustPress plugins. This enables workflows to leverage plugin functionality and extend capabilities.

Each plugin can expose multiple actions with specific parameters and return values. Check the plugin documentation for available actions.`,
    useCases: [
      'Run SEO analysis with SEO plugin',
      'Track analytics events',
      'Process payments with payment plugins',
      'Share to social media platforms',
      'Send SMS via communication plugins',
      'Generate PDFs with document plugins',
    ],
    configuration: [
      {
        name: 'pluginId',
        type: 'select',
        description: 'The plugin to call',
        required: true,
        tips: ['Only plugins with workflow actions appear', 'Plugin must be installed and active'],
      },
      {
        name: 'action',
        type: 'string',
        description: 'The plugin action to invoke',
        required: true,
        placeholder: 'analyze',
        tips: ['Check plugin documentation for available actions', 'Action names are case-sensitive'],
      },
      {
        name: 'params',
        type: 'json',
        description: 'Parameters for the plugin action',
        required: false,
        defaultValue: {},
        tips: ['Parameters depend on the specific action', 'Use expressions: {{input.field}}'],
      },
    ],
    examples: [
      {
        title: 'SEO Analysis',
        description: 'Run SEO analysis on content',
        configuration: {
          pluginId: 'seo-optimizer',
          action: 'analyze',
          params: {
            contentId: '{{input.postId}}',
            keywords: ['workflow', 'automation'],
          },
        },
        expectedOutput: '{ "score": 85, "suggestions": [...], "issues": [...] }',
      },
      {
        title: 'Social Media Share',
        description: 'Post content to Twitter',
        configuration: {
          pluginId: 'social-share',
          action: 'postToTwitter',
          params: {
            message: 'Check out: {{input.title}}',
            url: '{{input.url}}',
            image: '{{input.featuredImage}}',
          },
        },
      },
      {
        title: 'Generate PDF',
        description: 'Convert content to PDF',
        configuration: {
          pluginId: 'pdf-generator',
          action: 'createPdf',
          params: {
            html: '{{input.content}}',
            filename: '{{input.title}}.pdf',
          },
        },
      },
    ],
    bestPractices: [
      'Verify plugin is installed and active before using',
      'Review plugin documentation for action parameters',
      'Handle plugin errors gracefully with Error Handler',
      'Test with sample data before production use',
      'Keep plugins updated for latest features',
    ],
    commonIssues: [
      {
        issue: 'Plugin not found',
        cause: 'Plugin not installed or inactive',
        solution: 'Install and activate the plugin from Plugins page.',
      },
      {
        issue: 'Action not found',
        cause: 'Invalid action name or plugin version mismatch',
        solution: 'Check plugin documentation for valid action names. Update plugin if needed.',
      },
      {
        issue: 'Invalid parameters',
        cause: 'Missing or wrong parameter types',
        solution: 'Review action documentation for required parameters.',
      },
    ],
    relatedNodes: ['run_function', 'http_request', 'if_else'],
  },

  // ============================================
  // LOGIC NODES
  // ============================================

  'if_else': {
    id: 'if_else',
    name: 'If/Else',
    category: 'Logic',
    shortDescription: 'Conditional branching based on expression',
    fullDescription: `The If/Else node routes workflow execution based on a condition. If the condition evaluates to true, data flows through the "True" output; otherwise, it flows through the "False" output.

Use JavaScript expressions to define conditions. The input data is available as "input" in your expression.`,
    useCases: [
      'Route based on data values or status',
      'Handle success/failure cases differently',
      'Filter data conditionally',
      'Implement business rules and logic',
      'Error handling branches',
      'User permission checks',
    ],
    configuration: [
      {
        name: 'condition',
        type: 'expression',
        description: 'JavaScript expression that evaluates to true or false',
        required: true,
        placeholder: 'input.status === 200',
        tips: [
          'Access input data with input.fieldName',
          'Use === for strict equality',
          'Combine conditions with && (and) or || (or)',
        ],
      },
    ],
    examples: [
      {
        title: 'Check HTTP Status',
        description: 'Branch based on API response status',
        configuration: {
          condition: 'input.status === 200',
        },
      },
      {
        title: 'Validate Email',
        description: 'Check if email is valid',
        configuration: {
          condition: 'input.email && input.email.includes("@") && input.email.includes(".")',
        },
      },
      {
        title: 'Compare Values',
        description: 'Check if amount exceeds threshold',
        configuration: {
          condition: 'input.amount > 1000',
        },
      },
      {
        title: 'Check Array Length',
        description: 'Verify array has items',
        configuration: {
          condition: 'input.items && input.items.length > 0',
        },
      },
      {
        title: 'Multiple Conditions',
        description: 'Check status and type',
        configuration: {
          condition: 'input.status === "active" && input.type === "premium"',
        },
      },
    ],
    bestPractices: [
      'Keep conditions simple and readable',
      'Use parentheses for complex logic: (a && b) || c',
      'Test both true and false paths thoroughly',
      'Add Log nodes for debugging condition results',
      'Handle null/undefined with optional chaining: input?.field',
    ],
    commonIssues: [
      {
        issue: 'Condition always evaluates to true/false',
        cause: 'Incorrect expression or unexpected data structure',
        solution: 'Add a Log node before If/Else to see actual input data. Verify field names match.',
      },
      {
        issue: 'Expression syntax error',
        cause: 'Invalid JavaScript syntax',
        solution: 'Check for typos, missing quotes on strings, correct operators (=== not ==).',
      },
      {
        issue: 'Cannot read property of undefined',
        cause: 'Accessing nested property that doesnt exist',
        solution: 'Use optional chaining: input?.user?.email instead of input.user.email',
      },
    ],
    relatedNodes: ['switch', 'merge', 'error_handler', 'log'],
  },

  'switch': {
    id: 'switch',
    name: 'Switch',
    category: 'Logic',
    shortDescription: 'Multiple condition branches',
    fullDescription: `The Switch node routes data to different outputs based on matching a value against multiple cases. Similar to a switch statement in programming.

Define an expression to evaluate, then specify cases to match against. Data flows through the matching case output, or the default output if no match is found.`,
    useCases: [
      'Route by content type or status',
      'Handle multiple categories differently',
      'Implement state machines',
      'Multi-path data processing',
      'API response code handling',
    ],
    configuration: [
      {
        name: 'expression',
        type: 'expression',
        description: 'Expression to evaluate for case matching',
        required: true,
        placeholder: 'input.status',
        tips: ['This value is compared against each case', 'Can be any expression that returns a value'],
      },
      {
        name: 'cases',
        type: 'json',
        description: 'Array of case values to match against',
        required: true,
        defaultValue: [],
        placeholder: '["pending", "approved", "rejected"]',
        tips: ['Each case becomes a separate output port', 'Default output used when no case matches'],
      },
    ],
    examples: [
      {
        title: 'Route by Content Type',
        description: 'Different processing for each content type',
        configuration: {
          expression: 'input.contentType',
          cases: ['post', 'page', 'product', 'event'],
        },
      },
      {
        title: 'HTTP Status Routing',
        description: 'Handle different response codes',
        configuration: {
          expression: 'input.status',
          cases: [200, 201, 400, 404, 500],
        },
      },
      {
        title: 'Priority Routing',
        description: 'Route by priority level',
        configuration: {
          expression: 'input.priority',
          cases: ['critical', 'high', 'medium', 'low'],
        },
      },
    ],
    bestPractices: [
      'Always handle the default case for unexpected values',
      'Use meaningful case names that match your data',
      'Consider If/Else for simple binary choices',
      'Document what happens in each case branch',
    ],
    commonIssues: [
      {
        issue: 'Always goes to default output',
        cause: 'Case values dont match expression result (type mismatch)',
        solution: 'Check exact values including type. "200" (string) !== 200 (number). Log the expression result.',
      },
      {
        issue: 'Missing cases in output',
        cause: 'Cases array empty or not configured',
        solution: 'Add case values to the cases array.',
      },
    ],
    relatedNodes: ['if_else', 'merge', 'parallel'],
  },

  'loop': {
    id: 'loop',
    name: 'Loop',
    category: 'Logic',
    shortDescription: 'Iterate over array items',
    fullDescription: `The Loop node processes each item in an array sequentially or in parallel. For each iteration, the current item is passed to connected nodes through the "Item" output.

After processing all items, the collected results are available on the "All Results" output. Use this for batch processing, sending multiple notifications, or transforming arrays.`,
    useCases: [
      'Process multiple database records',
      'Send batch email notifications',
      'Transform each item in an array',
      'Aggregate results from multiple operations',
      'Make parallel API calls for each item',
    ],
    configuration: [
      {
        name: 'maxIterations',
        type: 'number',
        description: 'Maximum number of iterations (safety limit)',
        required: false,
        defaultValue: 100,
        tips: ['Prevents infinite loops', 'Increase for large datasets'],
      },
      {
        name: 'parallel',
        type: 'boolean',
        description: 'Run iterations in parallel instead of sequentially',
        required: false,
        defaultValue: false,
        tips: ['Parallel is faster but order not guaranteed', 'Use sequential when order matters'],
      },
      {
        name: 'batchSize',
        type: 'number',
        description: 'Number of parallel items per batch',
        required: false,
        defaultValue: 10,
        tips: ['Only applies when parallel is true', 'Lower values = less memory, slower'],
      },
    ],
    examples: [
      {
        title: 'Send Email to Each User',
        description: 'Loop through users and send personalized emails',
        configuration: {
          maxIterations: 1000,
          parallel: true,
          batchSize: 50,
        },
      },
      {
        title: 'Sequential Processing',
        description: 'Process items one by one maintaining order',
        configuration: {
          maxIterations: 100,
          parallel: false,
        },
      },
      {
        title: 'API Calls Per Item',
        description: 'Make an API call for each item with rate limiting',
        configuration: {
          maxIterations: 500,
          parallel: true,
          batchSize: 5,
        },
      },
    ],
    bestPractices: [
      'Set reasonable maxIterations to prevent runaway loops',
      'Use parallel for independent operations (emails, API calls)',
      'Use sequential when operations depend on previous results',
      'Smaller batch sizes reduce memory but increase time',
      'Add error handling inside the loop for resilience',
    ],
    commonIssues: [
      {
        issue: 'Loop runs forever or takes too long',
        cause: 'maxIterations too high or infinite data source',
        solution: 'Set appropriate maxIterations limit. Check input array length.',
      },
      {
        issue: 'Results out of order',
        cause: 'Parallel processing doesnt maintain order',
        solution: 'Use sequential mode (parallel: false) or sort results after.',
      },
      {
        issue: 'Memory error with large arrays',
        cause: 'Too many parallel operations',
        solution: 'Reduce batchSize or use sequential processing.',
      },
    ],
    relatedNodes: ['map', 'filter', 'merge', 'parallel'],
  },

  'parallel': {
    id: 'parallel',
    name: 'Parallel',
    category: 'Logic',
    shortDescription: 'Run multiple branches simultaneously',
    fullDescription: `The Parallel node splits the workflow into multiple branches that execute simultaneously. Each branch receives a copy of the same input data.

Use this when you need to perform independent operations that don't depend on each other, then combine results with a Merge node.`,
    useCases: [
      'Simultaneous API calls to different services',
      'Multi-channel notifications (email + SMS + push)',
      'Concurrent data processing',
      'Performance optimization for independent tasks',
      'Redundant operations for reliability',
    ],
    configuration: [],
    examples: [
      {
        title: 'Multi-Channel Notification',
        description: 'Send email, SMS, and push notification at the same time',
        configuration: {},
      },
      {
        title: 'Parallel Data Fetch',
        description: 'Fetch from multiple APIs simultaneously',
        configuration: {},
      },
      {
        title: 'Concurrent Processing',
        description: 'Run multiple transformations in parallel',
        configuration: {},
      },
    ],
    bestPractices: [
      'Use for truly independent operations only',
      'Combine with Merge node to collect all results',
      'Consider resource limits (API rate limits, memory)',
      'Handle partial failures appropriately',
      'Each branch should be able to complete independently',
    ],
    commonIssues: [
      {
        issue: 'One branch blocks or slows others',
        cause: 'Branches sharing resources or state',
        solution: 'Ensure branches are truly independent. Check for shared state.',
      },
      {
        issue: 'Resource exhaustion',
        cause: 'Too many parallel operations',
        solution: 'Limit number of parallel branches or add delays.',
      },
    ],
    relatedNodes: ['merge', 'if_else', 'loop'],
  },

  'merge': {
    id: 'merge',
    name: 'Merge',
    category: 'Logic',
    shortDescription: 'Combine multiple inputs into one output',
    fullDescription: `The Merge node combines data from multiple branches back into a single flow. Configure how to merge: wait for all inputs, use first to complete, or combine data together.

Essential for collecting results from parallel operations or rejoining conditional branches.`,
    useCases: [
      'Collect results from parallel branches',
      'Rejoin conditional (If/Else) branches',
      'Aggregate data from multiple sources',
      'Create synchronization points',
      'Consolidate multi-channel results',
    ],
    configuration: [
      {
        name: 'mergeMode',
        type: 'select',
        description: 'How to merge multiple inputs',
        required: true,
        defaultValue: 'wait_all',
        options: [
          { value: 'wait_all', label: 'Wait All', description: 'Wait for all inputs before continuing' },
          { value: 'race', label: 'First Completed', description: 'Use first input to arrive' },
          { value: 'combine', label: 'Combine', description: 'Merge all input data into one object' },
        ],
        tips: ['Wait All returns array of all results', 'Race is useful for redundancy', 'Combine merges objects'],
      },
    ],
    examples: [
      {
        title: 'Collect All Results',
        description: 'Wait for all parallel operations to complete',
        configuration: {
          mergeMode: 'wait_all',
        },
        expectedOutput: '[{"source": "api1", "data": ...}, {"source": "api2", "data": ...}]',
      },
      {
        title: 'Use Fastest Response',
        description: 'Use whichever API responds first',
        configuration: {
          mergeMode: 'race',
        },
      },
      {
        title: 'Combine Data',
        description: 'Merge data from multiple sources into one object',
        configuration: {
          mergeMode: 'combine',
        },
        expectedOutput: '{ "userData": {...}, "orderData": {...}, "analyticsData": {...} }',
      },
    ],
    bestPractices: [
      'Use wait_all when you need all data before proceeding',
      'Use race for redundant data sources or timeouts',
      'Use combine when merging complementary data',
      'Handle scenarios where some inputs might fail',
      'Consider timeout scenarios for wait_all',
    ],
    commonIssues: [
      {
        issue: 'Merge never completes',
        cause: 'One or more inputs never arrive (branch error)',
        solution: 'Check all input branches complete properly. Add error handling to branches.',
      },
      {
        issue: 'Missing data in merge result',
        cause: 'Branch failed or returned empty',
        solution: 'Add error handling and default values in branches.',
      },
    ],
    relatedNodes: ['parallel', 'if_else', 'switch', 'loop'],
  },

  // ============================================
  // TRANSFORM NODES
  // ============================================

  'map': {
    id: 'map',
    name: 'Map',
    category: 'Transform',
    shortDescription: 'Transform each item in an array',
    fullDescription: `The Map node applies a transformation expression to each item in an array, returning a new array with the transformed values.

Similar to JavaScript's Array.map() function. Access the current item as "item" in your expression. The output array has the same length as the input array.`,
    useCases: [
      'Extract specific fields from objects',
      'Transform data format or structure',
      'Calculate derived values',
      'Normalize or clean data',
      'Format output for display',
    ],
    configuration: [
      {
        name: 'expression',
        type: 'expression',
        description: 'Transformation expression applied to each item',
        required: true,
        placeholder: 'item.name',
        tips: [
          'Use "item" to reference each array element',
          'Return objects with spread: { ...item, newField: value }',
          'Can call functions: item.name.toUpperCase()',
        ],
      },
    ],
    examples: [
      {
        title: 'Extract Names',
        description: 'Get just the names from user objects',
        configuration: {
          expression: 'item.name',
        },
        expectedOutput: '["John", "Jane", "Bob"]',
      },
      {
        title: 'Add Calculated Field',
        description: 'Add total price to each order item',
        configuration: {
          expression: '{ ...item, total: item.price * item.quantity }',
        },
        expectedOutput: '[{ "name": "Widget", "price": 10, "quantity": 2, "total": 20 }, ...]',
      },
      {
        title: 'Format Dates',
        description: 'Convert timestamps to readable dates',
        configuration: {
          expression: '{ ...item, formattedDate: new Date(item.timestamp).toLocaleDateString() }',
        },
      },
      {
        title: 'Rename Fields',
        description: 'Change field names in objects',
        configuration: {
          expression: '{ id: item.user_id, email: item.user_email, name: item.user_name }',
        },
      },
    ],
    bestPractices: [
      'Keep transformations simple and focused',
      'Use spread operator to preserve existing fields: { ...item, newField }',
      'Handle null/undefined with optional chaining: item?.property',
      'Test with sample data before processing large arrays',
    ],
    commonIssues: [
      {
        issue: 'Undefined values in output',
        cause: 'Accessing properties that dont exist',
        solution: 'Use optional chaining: item?.property. Log sample item to verify structure.',
      },
      {
        issue: 'Expression error',
        cause: 'Invalid JavaScript syntax',
        solution: 'Check syntax. Remember item is the variable name for each element.',
      },
    ],
    relatedNodes: ['filter', 'loop', 'template'],
  },

  'filter': {
    id: 'filter',
    name: 'Filter',
    category: 'Transform',
    shortDescription: 'Filter array items by condition',
    fullDescription: `The Filter node removes items from an array that don't match a condition. Only items where the condition evaluates to true are kept in the output.

Similar to JavaScript's Array.filter() function. Access the current item as "item" in your condition expression.`,
    useCases: [
      'Remove invalid or incomplete data',
      'Select records matching criteria',
      'Exclude certain types or categories',
      'Find specific items in array',
      'Data validation and cleaning',
    ],
    configuration: [
      {
        name: 'condition',
        type: 'expression',
        description: 'Condition expression - items where this is true are kept',
        required: true,
        placeholder: 'item.status === "active"',
        tips: [
          'Use "item" to reference each array element',
          'Return true to keep the item, false to remove',
          'Combine conditions with && and ||',
        ],
      },
    ],
    examples: [
      {
        title: 'Active Users Only',
        description: 'Keep only users with active status',
        configuration: {
          condition: 'item.status === "active"',
        },
      },
      {
        title: 'High Value Orders',
        description: 'Filter orders over $100',
        configuration: {
          condition: 'item.total > 100',
        },
      },
      {
        title: 'Valid Emails',
        description: 'Keep items with valid email format',
        configuration: {
          condition: 'item.email && item.email.includes("@")',
        },
      },
      {
        title: 'Recent Items',
        description: 'Keep items from last 7 days',
        configuration: {
          condition: 'new Date(item.createdAt) > new Date(Date.now() - 7*24*60*60*1000)',
        },
      },
    ],
    bestPractices: [
      'Test conditions with edge cases (null, empty, boundary values)',
      'Handle null/undefined gracefully in conditions',
      'Consider what happens with empty array result',
      'Combine with Map for filter-and-transform operations',
    ],
    commonIssues: [
      {
        issue: 'All items filtered out (empty result)',
        cause: 'Condition too restrictive or data mismatch',
        solution: 'Verify condition logic. Log sample items to see actual data structure.',
      },
      {
        issue: 'No items filtered (same as input)',
        cause: 'Condition too lenient or always true',
        solution: 'Check condition returns boolean. Verify data contains expected values.',
      },
    ],
    relatedNodes: ['map', 'if_else', 'loop'],
  },

  'template': {
    id: 'template',
    name: 'Template',
    category: 'Transform',
    shortDescription: 'Render dynamic text using templates',
    fullDescription: `The Template node renders text using template engines like Handlebars, Mustache, or EJS. Insert dynamic values from your input data into templates for emails, messages, HTML, or any text content.

Supports conditionals, loops, and helpers depending on the template engine chosen.`,
    useCases: [
      'Email content generation',
      'Dynamic message formatting',
      'HTML page generation',
      'Report generation',
      'Notification message templates',
      'Dynamic configuration files',
    ],
    configuration: [
      {
        name: 'template',
        type: 'template',
        description: 'Template content with placeholders',
        required: true,
        placeholder: 'Hello {{name}}, your order #{{orderId}} is ready!',
        tips: [
          'Use {{variable}} for Handlebars/Mustache',
          'Use <%= variable %> for EJS',
          'Access nested: {{user.name}}',
        ],
      },
      {
        name: 'engine',
        type: 'select',
        description: 'Template engine to use',
        required: false,
        defaultValue: 'handlebars',
        options: [
          { value: 'handlebars', label: 'Handlebars', description: 'Most popular, good for HTML' },
          { value: 'mustache', label: 'Mustache', description: 'Simpler, logic-less templates' },
          { value: 'ejs', label: 'EJS', description: 'Embedded JavaScript, most powerful' },
        ],
      },
    ],
    examples: [
      {
        title: 'Simple Greeting',
        description: 'Generate personalized greeting',
        configuration: {
          template: 'Hello {{name}}, welcome to {{company}}!',
          engine: 'handlebars',
        },
        expectedOutput: 'Hello John, welcome to Acme Corp!',
      },
      {
        title: 'Email with List',
        description: 'Email template with item list',
        configuration: {
          template: 'Your order contains:\n{{#each items}}\n- {{this.name}}: {{this.price}}\n{{/each}}\nTotal: {{total}}',
          engine: 'handlebars',
        },
      },
      {
        title: 'Conditional Content',
        description: 'Show different content based on condition',
        configuration: {
          template: '{{#if isPremium}}Thanks for being a premium member!{{else}}Upgrade to premium today!{{/if}}',
          engine: 'handlebars',
        },
      },
    ],
    bestPractices: [
      'Escape HTML for user-provided data to prevent XSS',
      'Use partials/includes for reusable template components',
      'Test templates with various data scenarios',
      'Keep templates readable with proper formatting',
      'Document expected input data structure',
    ],
    commonIssues: [
      {
        issue: 'Variable shows as empty or undefined',
        cause: 'Variable name mismatch or missing data',
        solution: 'Verify variable names exactly match input data keys. Log input to check.',
      },
      {
        issue: 'HTML tags showing as text',
        cause: 'HTML escaping enabled (default for safety)',
        solution: 'Use triple braces {{{html}}} for raw HTML in Handlebars.',
      },
      {
        issue: 'Template syntax error',
        cause: 'Incorrect template syntax for chosen engine',
        solution: 'Check syntax for your template engine. Handlebars uses {{}} while EJS uses <%= %>.',
      },
    ],
    relatedNodes: ['send_email', 'map', 'http_request', 'create_content'],
  },

  // ============================================
  // UTILITY NODES
  // ============================================

  'delay': {
    id: 'delay',
    name: 'Delay',
    category: 'Utilities',
    shortDescription: 'Wait for a specified duration',
    fullDescription: `The Delay node pauses workflow execution for a specified amount of time. The input data passes through unchanged after the delay completes.

Useful for rate limiting API calls, scheduling actions, adding cooldown periods, or waiting for external processes.`,
    useCases: [
      'Rate limiting external API calls',
      'Adding cooldown between operations',
      'Scheduled delays in processing',
      'Debouncing rapid events',
      'Waiting for external processes to complete',
    ],
    configuration: [
      {
        name: 'duration',
        type: 'number',
        description: 'Delay duration in milliseconds',
        required: true,
        defaultValue: 1000,
        placeholder: '1000',
        tips: ['1000ms = 1 second', '60000ms = 1 minute', 'Max recommended: 300000ms (5 min)'],
      },
    ],
    examples: [
      {
        title: 'One Second Delay',
        description: 'Wait one second between operations',
        configuration: {
          duration: 1000,
        },
      },
      {
        title: 'API Rate Limit',
        description: 'Wait 500ms between API calls',
        configuration: {
          duration: 500,
        },
      },
      {
        title: 'One Minute Wait',
        description: 'Wait one minute for external process',
        configuration: {
          duration: 60000,
        },
      },
    ],
    bestPractices: [
      'Use for rate limiting when calling external APIs',
      'Keep delays reasonable to avoid workflow timeouts',
      'Document why delays are needed',
      'Consider using Retry node instead for error recovery',
    ],
    commonIssues: [
      {
        issue: 'Workflow times out',
        cause: 'Delay duration exceeds workflow timeout',
        solution: 'Reduce delay duration or increase workflow timeout limit.',
      },
      {
        issue: 'Delay seems ignored',
        cause: 'Using parallel processing',
        solution: 'Delays work per-branch. Use sequential processing if needed.',
      },
    ],
    relatedNodes: ['retry', 'loop', 'http_request'],
  },

  'retry': {
    id: 'retry',
    name: 'Retry',
    category: 'Utilities',
    shortDescription: 'Retry failed operations with backoff',
    fullDescription: `The Retry node automatically retries operations that fail, with configurable backoff strategies. If the operation succeeds, data flows to "Success" output. If all retries fail, data flows to "Failed" output.

Supports fixed, exponential, and linear backoff patterns for intelligent retry timing.`,
    useCases: [
      'Handle transient API failures',
      'Network reliability improvements',
      'Database connection recovery',
      'External service resilience',
      'Rate limit handling with backoff',
    ],
    configuration: [
      {
        name: 'maxAttempts',
        type: 'number',
        description: 'Maximum number of retry attempts',
        required: false,
        defaultValue: 3,
        tips: ['Total attempts = initial + retries', '3-5 attempts usually sufficient'],
      },
      {
        name: 'backoffType',
        type: 'select',
        description: 'How to increase delay between retries',
        required: false,
        defaultValue: 'exponential',
        options: [
          { value: 'fixed', label: 'Fixed', description: 'Same delay each time' },
          { value: 'exponential', label: 'Exponential', description: '1s, 2s, 4s, 8s... (recommended)' },
          { value: 'linear', label: 'Linear', description: '1s, 2s, 3s, 4s...' },
        ],
        tips: ['Exponential is best for API rate limits', 'Fixed for consistent timing needs'],
      },
      {
        name: 'initialDelay',
        type: 'number',
        description: 'Initial delay between retries (milliseconds)',
        required: false,
        defaultValue: 1000,
        tips: ['Delay increases based on backoff type', '1000ms is good starting point'],
      },
    ],
    examples: [
      {
        title: 'API with Exponential Backoff',
        description: 'Retry API calls with increasing delays',
        configuration: {
          maxAttempts: 5,
          backoffType: 'exponential',
          initialDelay: 1000,
        },
      },
      {
        title: 'Quick Fixed Retry',
        description: 'Fast retries with fixed interval',
        configuration: {
          maxAttempts: 3,
          backoffType: 'fixed',
          initialDelay: 500,
        },
      },
      {
        title: 'Database Reconnection',
        description: 'Retry database connection with linear backoff',
        configuration: {
          maxAttempts: 10,
          backoffType: 'linear',
          initialDelay: 2000,
        },
      },
    ],
    bestPractices: [
      'Use exponential backoff for external APIs (respects rate limits)',
      'Set reasonable maxAttempts (usually 3-5)',
      'Handle permanent failures in the Failed output',
      'Log retry attempts for debugging',
      'Consider what errors should NOT be retried (validation errors)',
    ],
    commonIssues: [
      {
        issue: 'Still failing after all retries',
        cause: 'Error is permanent, not transient',
        solution: 'Handle Failed output appropriately. Check if error is retryable.',
      },
      {
        issue: 'Retries taking too long',
        cause: 'Too many attempts or long delays',
        solution: 'Reduce maxAttempts or initialDelay.',
      },
    ],
    relatedNodes: ['http_request', 'error_handler', 'delay', 'database_query'],
  },

  'error_handler': {
    id: 'error_handler',
    name: 'Error Handler',
    category: 'Utilities',
    shortDescription: 'Catch and handle errors gracefully',
    fullDescription: `The Error Handler node catches errors from upstream nodes and provides graceful error handling. Configure whether to continue workflow, stop execution, or retry on error.

Successful data flows to "Success" output, while errors flow to "Error" output with detailed error information.`,
    useCases: [
      'Graceful error recovery',
      'Error logging and monitoring',
      'Fallback processing paths',
      'Error notification to admins',
      'Workflow resilience and stability',
    ],
    configuration: [
      {
        name: 'onError',
        type: 'select',
        description: 'What to do when an error occurs',
        required: true,
        defaultValue: 'continue',
        options: [
          { value: 'continue', label: 'Continue', description: 'Log error but continue workflow' },
          { value: 'stop', label: 'Stop', description: 'Halt workflow execution' },
          { value: 'retry', label: 'Retry', description: 'Retry the failed operation' },
        ],
      },
      {
        name: 'logError',
        type: 'boolean',
        description: 'Log error details to workflow logs',
        required: false,
        defaultValue: true,
        tips: ['Recommended for debugging', 'Includes stack trace and context'],
      },
    ],
    examples: [
      {
        title: 'Continue on Error',
        description: 'Log error but keep workflow running',
        configuration: {
          onError: 'continue',
          logError: true,
        },
      },
      {
        title: 'Stop on Critical Error',
        description: 'Halt workflow for critical operations',
        configuration: {
          onError: 'stop',
          logError: true,
        },
      },
      {
        title: 'Retry with Logging',
        description: 'Retry failed operations',
        configuration: {
          onError: 'retry',
          logError: true,
        },
      },
    ],
    bestPractices: [
      'Always log errors for debugging',
      'Use continue for non-critical operations',
      'Use stop for critical data integrity operations',
      'Send notifications for important errors',
      'Provide meaningful error context',
    ],
    commonIssues: [
      {
        issue: 'Errors not being caught',
        cause: 'Error handler not positioned correctly',
        solution: 'Error handler must be downstream of nodes that might fail.',
      },
      {
        issue: 'Silent failures',
        cause: 'logError disabled',
        solution: 'Enable logError to see what errors are occurring.',
      },
    ],
    relatedNodes: ['retry', 'log', 'send_email', 'if_else'],
  },

  'set_variable': {
    id: 'set_variable',
    name: 'Set Variable',
    category: 'Utilities',
    shortDescription: 'Store values in workflow variables',
    fullDescription: `The Set Variable node stores a value in a workflow-scoped variable that can be accessed by other nodes later in the workflow. Variables persist for the duration of the workflow execution.

Use this to pass data between disconnected parts of the workflow, store intermediate results, or accumulate values across iterations.`,
    useCases: [
      'Store intermediate calculation results',
      'Share data between parallel branches',
      'Accumulate values in loops',
      'Store configuration for later use',
      'Pass data to disconnected workflow parts',
    ],
    configuration: [
      {
        name: 'variableName',
        type: 'string',
        description: 'Name of the variable to set',
        required: true,
        placeholder: 'totalCount',
        tips: ['Use descriptive names: totalCount, processedUsers', 'Case-sensitive'],
      },
      {
        name: 'value',
        type: 'expression',
        description: 'Value to store (can use expressions)',
        required: true,
        placeholder: 'input.items.length',
        tips: ['Access input with input.field', 'Can be any data type'],
      },
    ],
    examples: [
      {
        title: 'Store Count',
        description: 'Store item count for later use',
        configuration: {
          variableName: 'totalItems',
          value: 'input.items.length',
        },
      },
      {
        title: 'Store Configuration',
        description: 'Store API endpoint for later',
        configuration: {
          variableName: 'apiEndpoint',
          value: '"https://api.example.com/v2"',
        },
      },
      {
        title: 'Accumulate Total',
        description: 'Add to running total in loop',
        configuration: {
          variableName: 'runningTotal',
          value: '(variables.runningTotal || 0) + input.amount',
        },
      },
    ],
    bestPractices: [
      'Use clear, descriptive variable names',
      'Document what each variable stores',
      'Initialize variables before using in expressions',
      'Avoid overwriting important variables accidentally',
    ],
    commonIssues: [
      {
        issue: 'Variable is undefined when accessed',
        cause: 'Variable not set before being accessed',
        solution: 'Ensure Set Variable runs before accessing the variable.',
      },
      {
        issue: 'Variable has unexpected value',
        cause: 'Variable overwritten by another Set Variable',
        solution: 'Check for multiple Set Variable nodes using same name.',
      },
    ],
    relatedNodes: ['if_else', 'loop', 'merge', 'log'],
  },

  'log': {
    id: 'log',
    name: 'Log',
    category: 'Utilities',
    shortDescription: 'Log data for debugging and monitoring',
    fullDescription: `The Log node outputs data to the workflow logs for debugging and monitoring purposes. Configure the log level and add custom messages.

Data passes through unchanged, making it easy to insert logging at any point without affecting the workflow flow.`,
    useCases: [
      'Debug data flow between nodes',
      'Monitor workflow progress',
      'Create audit trails',
      'Track performance metrics',
      'Investigate production issues',
    ],
    configuration: [
      {
        name: 'level',
        type: 'select',
        description: 'Log level/severity',
        required: false,
        defaultValue: 'info',
        options: [
          { value: 'debug', label: 'Debug', description: 'Detailed debugging info' },
          { value: 'info', label: 'Info', description: 'General information' },
          { value: 'warn', label: 'Warning', description: 'Warning messages' },
          { value: 'error', label: 'Error', description: 'Error conditions' },
        ],
      },
      {
        name: 'message',
        type: 'expression',
        description: 'Custom log message (optional)',
        required: false,
        placeholder: '"Processing user: " + input.userId',
        tips: ['Use + to concatenate strings', 'JSON.stringify(input) for full data'],
      },
    ],
    examples: [
      {
        title: 'Debug Data',
        description: 'Log current data structure for debugging',
        configuration: {
          level: 'debug',
          message: '"Current data: " + JSON.stringify(input)',
        },
      },
      {
        title: 'Track Progress',
        description: 'Log workflow progress with counts',
        configuration: {
          level: 'info',
          message: '"Processed " + input.count + " of " + input.total + " items"',
        },
      },
      {
        title: 'Warning Log',
        description: 'Log warning for unusual condition',
        configuration: {
          level: 'warn',
          message: '"Large batch size detected: " + input.items.length',
        },
      },
    ],
    bestPractices: [
      'Use appropriate log levels (debug for dev, info/warn for prod)',
      'Include relevant context in messages',
      'Remove excessive debug logs in production',
      'Never log sensitive data (passwords, tokens)',
      'Use structured logging when possible',
    ],
    commonIssues: [
      {
        issue: 'Logs not appearing',
        cause: 'Log level filtered out by configuration',
        solution: 'Check workflow log level settings. Debug logs may be filtered.',
      },
      {
        issue: 'Too much log output',
        cause: 'Logging in tight loops',
        solution: 'Move log node outside loop or use conditional logging.',
      },
    ],
    relatedNodes: ['error_handler', 'if_else', 'set_variable'],
  },

  // ============================================
  // INTEGRATION NODES
  // ============================================

  'rustpress_api': {
    id: 'rustpress_api',
    name: 'RustPress API',
    category: 'Integrations',
    shortDescription: 'Call RustPress internal APIs',
    fullDescription: `The RustPress API node provides direct access to RustPress internal APIs for managing content, users, media, comments, and settings.

Use this for CMS operations that require full API access, such as bulk operations, complex queries, or administrative tasks.`,
    useCases: [
      'Bulk content operations',
      'User management and queries',
      'Media library operations',
      'Comment moderation',
      'Settings management',
      'Custom admin operations',
    ],
    configuration: [
      {
        name: 'endpoint',
        type: 'select',
        description: 'RustPress API endpoint to call',
        required: true,
        options: [
          { value: '/api/posts', label: 'Posts', description: 'Blog posts and articles' },
          { value: '/api/pages', label: 'Pages', description: 'Static pages' },
          { value: '/api/media', label: 'Media', description: 'Media library items' },
          { value: '/api/users', label: 'Users', description: 'User accounts' },
          { value: '/api/comments', label: 'Comments', description: 'Post comments' },
          { value: '/api/settings', label: 'Settings', description: 'Site settings' },
        ],
      },
      {
        name: 'method',
        type: 'select',
        description: 'HTTP method for the API call',
        required: true,
        defaultValue: 'GET',
        options: [
          { value: 'GET', label: 'GET', description: 'Retrieve data' },
          { value: 'POST', label: 'POST', description: 'Create new items' },
          { value: 'PUT', label: 'PUT', description: 'Update existing items' },
          { value: 'DELETE', label: 'DELETE', description: 'Delete items' },
        ],
      },
      {
        name: 'params',
        type: 'json',
        description: 'API request parameters',
        required: false,
        defaultValue: {},
        tips: ['GET: query parameters', 'POST/PUT: request body', 'Use expressions: {{input.field}}'],
      },
    ],
    examples: [
      {
        title: 'Get Published Posts',
        description: 'Fetch all published blog posts',
        configuration: {
          endpoint: '/api/posts',
          method: 'GET',
          params: { status: 'published', limit: 50 },
        },
        expectedOutput: '{ "data": [{ "id": "...", "title": "...", ... }], "total": 42 }',
      },
      {
        title: 'Update User',
        description: 'Update user profile information',
        configuration: {
          endpoint: '/api/users',
          method: 'PUT',
          params: { id: '{{input.userId}}', name: '{{input.newName}}', email: '{{input.newEmail}}' },
        },
      },
      {
        title: 'Delete Comment',
        description: 'Remove a spam comment',
        configuration: {
          endpoint: '/api/comments',
          method: 'DELETE',
          params: { id: '{{input.commentId}}' },
        },
      },
    ],
    bestPractices: [
      'Use appropriate HTTP methods for operations',
      'Handle API errors with Error Handler',
      'Check permissions before destructive operations',
      'Validate data before sending to API',
      'Use pagination for large datasets',
    ],
    commonIssues: [
      {
        issue: 'Permission denied error',
        cause: 'Workflow lacks required permissions',
        solution: 'Check workflow execution permissions in settings.',
      },
      {
        issue: 'Resource not found',
        cause: 'Invalid ID or endpoint',
        solution: 'Verify the resource exists and endpoint is correct.',
      },
    ],
    relatedNodes: ['http_request', 'create_content', 'database_query', 'if_else'],
  },

  'sub_workflow': {
    id: 'sub_workflow',
    name: 'Sub-Workflow',
    category: 'Integrations',
    shortDescription: 'Execute another workflow',
    fullDescription: `The Sub-Workflow node triggers another workflow and optionally waits for it to complete. Use this to reuse common workflow patterns, create modular workflows, and maintain cleaner organization.

The input data is passed to the sub-workflow as its trigger data, and the sub-workflow's output is returned.`,
    useCases: [
      'Reuse common workflow patterns',
      'Create modular, maintainable workflows',
      'Conditional workflow execution',
      'Complex workflow orchestration',
      'Share logic across multiple workflows',
    ],
    configuration: [
      {
        name: 'workflowId',
        type: 'select',
        description: 'The workflow to execute',
        required: true,
        tips: ['Select from available workflows', 'Workflow must be active'],
      },
      {
        name: 'waitForCompletion',
        type: 'boolean',
        description: 'Wait for sub-workflow to finish before continuing',
        required: false,
        defaultValue: true,
        tips: ['True: wait and get result', 'False: fire-and-forget'],
      },
    ],
    examples: [
      {
        title: 'Reusable Notification',
        description: 'Call a notification workflow',
        configuration: {
          workflowId: 'send-notifications',
          waitForCompletion: true,
        },
        expectedOutput: '{ "emailSent": true, "smsSent": true }',
      },
      {
        title: 'Fire-and-Forget Processing',
        description: 'Start background processing without waiting',
        configuration: {
          workflowId: 'heavy-data-processing',
          waitForCompletion: false,
        },
      },
      {
        title: 'Conditional Sub-Workflow',
        description: 'Execute different workflow based on type',
        configuration: {
          workflowId: '{{input.workflowToRun}}',
          waitForCompletion: true,
        },
      },
    ],
    bestPractices: [
      'Design sub-workflows to be reusable and self-contained',
      'Document input/output contracts clearly',
      'Avoid circular workflow calls (A calls B calls A)',
      'Use for common patterns used across multiple workflows',
      'Consider timeout limits for long-running sub-workflows',
    ],
    commonIssues: [
      {
        issue: 'Workflow not found',
        cause: 'Sub-workflow deleted or ID changed',
        solution: 'Verify workflow exists and is active. Update ID if renamed.',
      },
      {
        issue: 'Circular execution detected',
        cause: 'Workflow directly or indirectly calls itself',
        solution: 'Review workflow dependencies. Break circular reference.',
      },
      {
        issue: 'Sub-workflow timeout',
        cause: 'Sub-workflow takes too long',
        solution: 'Optimize sub-workflow or use waitForCompletion: false.',
      },
    ],
    relatedNodes: ['run_function', 'parallel', 'if_else', 'loop'],
  },

  // ============================================
  // CUSTOM NODES
  // ============================================

  'custom_code': {
    id: 'custom_code',
    name: 'Custom Code',
    category: 'Custom',
    shortDescription: 'Execute custom JavaScript code',
    fullDescription: `The Custom Code node executes arbitrary JavaScript code for complex operations that aren't covered by other nodes. You have full control over data transformation and logic.

The input data is available as "input", and you must return the output value. Supports async/await for asynchronous operations when enabled.`,
    useCases: [
      'Complex data transformations',
      'Custom business logic',
      'Advanced calculations and algorithms',
      'Data format conversions',
      'Specialized operations not covered by other nodes',
      'Quick prototyping of new functionality',
    ],
    configuration: [
      {
        name: 'code',
        type: 'code',
        description: 'JavaScript code to execute',
        required: true,
        placeholder: '// Access input data with "input"\nconst result = input.value * 2;\nreturn result;',
        tips: [
          'Access input with "input" variable',
          'Must return a value',
          'Use try/catch for error handling',
        ],
      },
      {
        name: 'async',
        type: 'boolean',
        description: 'Enable async/await support',
        required: false,
        defaultValue: false,
        tips: ['Enable for fetch, file operations, etc.', 'Code runs as async function'],
      },
    ],
    examples: [
      {
        title: 'Calculate Statistics',
        description: 'Calculate average and sum from array',
        configuration: {
          code: `const values = input.numbers;
const sum = values.reduce((a, b) => a + b, 0);
const avg = sum / values.length;
const max = Math.max(...values);
const min = Math.min(...values);

return {
  sum,
  average: avg,
  max,
  min,
  count: values.length
};`,
          async: false,
        },
        expectedOutput: '{ "sum": 150, "average": 30, "max": 50, "min": 10, "count": 5 }',
      },
      {
        title: 'Format and Validate',
        description: 'Clean and validate user data',
        configuration: {
          code: `const { name, email, phone } = input;

// Validate email
const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const isValidEmail = emailRegex.test(email);

// Format phone
const cleanPhone = phone.replace(/\\D/g, '');

return {
  name: name.trim(),
  email: email.toLowerCase().trim(),
  phone: cleanPhone,
  isValid: isValidEmail && cleanPhone.length >= 10
};`,
          async: false,
        },
      },
      {
        title: 'Async External Call',
        description: 'Make async operation (requires async: true)',
        configuration: {
          code: `const response = await fetch('https://api.example.com/data');
const data = await response.json();

return {
  status: response.status,
  data: data
};`,
          async: true,
        },
      },
    ],
    bestPractices: [
      'Keep code simple and focused on single task',
      'Always handle errors with try/catch',
      'Validate input data before processing',
      'Return consistent data structures',
      'Add comments for complex logic',
      'Test code thoroughly before production',
    ],
    commonIssues: [
      {
        issue: 'Code throws runtime error',
        cause: 'Bug in code or unexpected input',
        solution: 'Wrap code in try/catch. Add input validation. Check error message.',
      },
      {
        issue: 'Output is undefined',
        cause: 'Missing return statement',
        solution: 'Ensure your code ends with a return statement.',
      },
      {
        issue: 'Async/await not working',
        cause: 'async option not enabled',
        solution: 'Set async: true in configuration to enable async/await.',
      },
      {
        issue: 'Cannot access input',
        cause: 'Using wrong variable name',
        solution: 'Input data is available as "input", not "data" or other names.',
      },
    ],
    relatedNodes: ['run_function', 'map', 'filter', 'template'],
  },
};

// Helper function to get documentation for a node type
export function getNodeDocumentation(nodeType: string): NodeDocumentation | undefined {
  return nodeDocumentation[nodeType];
}

// Get all documented node types
export function getAllDocumentedNodeTypes(): string[] {
  return Object.keys(nodeDocumentation);
}

// Search documentation by keyword
export function searchNodeDocumentation(keyword: string): NodeDocumentation[] {
  const lowerKeyword = keyword.toLowerCase();
  return Object.values(nodeDocumentation).filter(
    (doc) =>
      doc.name.toLowerCase().includes(lowerKeyword) ||
      doc.shortDescription.toLowerCase().includes(lowerKeyword) ||
      doc.fullDescription.toLowerCase().includes(lowerKeyword) ||
      doc.category.toLowerCase().includes(lowerKeyword) ||
      doc.useCases.some((uc) => uc.toLowerCase().includes(lowerKeyword))
  );
}

// Get nodes by category
export function getNodesByCategory(category: string): NodeDocumentation[] {
  return Object.values(nodeDocumentation).filter(
    (doc) => doc.category.toLowerCase() === category.toLowerCase()
  );
}
