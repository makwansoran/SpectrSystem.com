/**
 * Integration Definitions
 * Defines third-party integrations organized by category
 */

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'file';
    label: string;
    required?: boolean;
    default?: any;
    options?: string[]; // For select type
    placeholder?: string;
  }>;
}

export interface IntegrationProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  actions: Record<string, IntegrationAction>;
}

export interface IntegrationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  providers: Record<string, IntegrationProvider>;
}

// Financial Integration
export const FINANCIAL_INTEGRATIONS: IntegrationCategory = {
  id: 'financial',
  name: 'Financial Integration',
  description: 'Payment and financial services',
  icon: 'CreditCard',
  color: '#635bff',
  providers: {
    stripe: {
      id: 'stripe',
      name: 'Stripe',
      icon: 'CreditCard',
      color: '#635bff',
      description: 'Payment processing',
      actions: {
        'create-payment': {
          id: 'create-payment',
          name: 'Create Payment',
          description: 'Process a payment',
          parameters: [
            { name: 'amount', type: 'number', label: 'Amount', required: true, placeholder: '100.00' },
            { name: 'currency', type: 'select', label: 'Currency', required: true, options: ['usd', 'eur', 'gbp'], default: 'usd' },
            { name: 'customer_id', type: 'string', label: 'Customer ID', placeholder: 'cus_...' },
            { name: 'description', type: 'string', label: 'Description', placeholder: 'Payment description' },
          ],
        },
        'get-customer': {
          id: 'get-customer',
          name: 'Get Customer',
          description: 'Retrieve customer information',
          parameters: [
            { name: 'customer_id', type: 'string', label: 'Customer ID', required: true, placeholder: 'cus_...' },
          ],
        },
        'refund': {
          id: 'refund',
          name: 'Refund Payment',
          description: 'Refund a payment',
          parameters: [
            { name: 'payment_id', type: 'string', label: 'Payment ID', required: true, placeholder: 'pi_...' },
            { name: 'amount', type: 'number', label: 'Amount (optional)', placeholder: 'Leave empty for full refund' },
          ],
        },
      },
    },
    paypal: {
      id: 'paypal',
      name: 'PayPal',
      icon: 'Wallet',
      color: '#003087',
      description: 'PayPal payments',
      actions: {
        'create-order': {
          id: 'create-order',
          name: 'Create Order',
          description: 'Create a PayPal order',
          parameters: [
            { name: 'amount', type: 'number', label: 'Amount', required: true },
            { name: 'currency', type: 'select', label: 'Currency', options: ['USD', 'EUR', 'GBP'], default: 'USD' },
          ],
        },
        'capture-payment': {
          id: 'capture-payment',
          name: 'Capture Payment',
          description: 'Capture a payment',
          parameters: [
            { name: 'order_id', type: 'string', label: 'Order ID', required: true },
          ],
        },
      },
    },
    square: {
      id: 'square',
      name: 'Square',
      icon: 'Square',
      color: '#006aff',
      description: 'Square payments',
      actions: {
        'create-payment': {
          id: 'create-payment',
          name: 'Create Payment',
          description: 'Process a Square payment',
          parameters: [
            { name: 'amount', type: 'number', label: 'Amount', required: true },
            { name: 'currency', type: 'select', label: 'Currency', options: ['USD'], default: 'USD' },
          ],
        },
      },
    },
  },
};

// E-commerce Integration
export const ECOMMERCE_INTEGRATIONS: IntegrationCategory = {
  id: 'ecommerce',
  name: 'E-commerce Integration',
  description: 'E-commerce platforms',
  icon: 'ShoppingBag',
  color: '#96bf48',
  providers: {
    shopify: {
      id: 'shopify',
      name: 'Shopify',
      icon: 'ShoppingBag',
      color: '#96bf48',
      description: 'Shopify store management',
      actions: {
        'create-product': {
          id: 'create-product',
          name: 'Create Product',
          description: 'Create a new product',
          parameters: [
            { name: 'title', type: 'string', label: 'Product Title', required: true },
            { name: 'price', type: 'number', label: 'Price', required: true },
            { name: 'description', type: 'textarea', label: 'Description' },
            { name: 'inventory_quantity', type: 'number', label: 'Inventory Quantity', default: 0 },
          ],
        },
        'get-orders': {
          id: 'get-orders',
          name: 'Get Orders',
          description: 'Retrieve orders',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
            { name: 'status', type: 'select', label: 'Status', options: ['open', 'closed', 'cancelled'], default: 'open' },
          ],
        },
        'update-customer': {
          id: 'update-customer',
          name: 'Update Customer',
          description: 'Update customer information',
          parameters: [
            { name: 'customer_id', type: 'string', label: 'Customer ID', required: true },
            { name: 'email', type: 'string', label: 'Email' },
            { name: 'first_name', type: 'string', label: 'First Name' },
            { name: 'last_name', type: 'string', label: 'Last Name' },
          ],
        },
      },
    },
    woocommerce: {
      id: 'woocommerce',
      name: 'WooCommerce',
      icon: 'ShoppingCart',
      color: '#96588a',
      description: 'WooCommerce store',
      actions: {
        'create-product': {
          id: 'create-product',
          name: 'Create Product',
          description: 'Create a new product',
          parameters: [
            { name: 'name', type: 'string', label: 'Product Name', required: true },
            { name: 'price', type: 'number', label: 'Price', required: true },
          ],
        },
        'get-orders': {
          id: 'get-orders',
          name: 'Get Orders',
          description: 'Retrieve orders',
          parameters: [
            { name: 'per_page', type: 'number', label: 'Per Page', default: 10 },
          ],
        },
      },
    },
  },
};

// Database Integration
export const DATABASE_INTEGRATIONS: IntegrationCategory = {
  id: 'database',
  name: 'Database Integration',
  description: 'Database services',
  icon: 'Database',
  color: '#336791',
  providers: {
    postgres: {
      id: 'postgres',
      name: 'PostgreSQL',
      icon: 'Database',
      color: '#336791',
      description: 'PostgreSQL database',
      actions: {
        'query': {
          id: 'query',
          name: 'Execute Query',
          description: 'Run a SQL query',
          parameters: [
            { name: 'query', type: 'textarea', label: 'SQL Query', required: true, placeholder: 'SELECT * FROM users' },
          ],
        },
        'insert': {
          id: 'insert',
          name: 'Insert Record',
          description: 'Insert a new record',
          parameters: [
            { name: 'table', type: 'string', label: 'Table Name', required: true },
            { name: 'data', type: 'textarea', label: 'Data (JSON)', required: true, placeholder: '{"name": "John", "email": "john@example.com"}' },
          ],
        },
      },
    },
    mysql: {
      id: 'mysql',
      name: 'MySQL',
      icon: 'Database',
      color: '#4479a1',
      description: 'MySQL database',
      actions: {
        'query': {
          id: 'query',
          name: 'Execute Query',
          description: 'Run a SQL query',
          parameters: [
            { name: 'query', type: 'textarea', label: 'SQL Query', required: true },
          ],
        },
      },
    },
    mongodb: {
      id: 'mongodb',
      name: 'MongoDB',
      icon: 'Leaf',
      color: '#47a248',
      description: 'MongoDB database',
      actions: {
        'find': {
          id: 'find',
          name: 'Find Documents',
          description: 'Find documents in collection',
          parameters: [
            { name: 'collection', type: 'string', label: 'Collection', required: true },
            { name: 'filter', type: 'textarea', label: 'Filter (JSON)', placeholder: '{"status": "active"}' },
          ],
        },
        'insert': {
          id: 'insert',
          name: 'Insert Document',
          description: 'Insert a document',
          parameters: [
            { name: 'collection', type: 'string', label: 'Collection', required: true },
            { name: 'document', type: 'textarea', label: 'Document (JSON)', required: true },
          ],
        },
      },
    },
    supabase: {
      id: 'supabase',
      name: 'Supabase',
      icon: 'Zap',
      color: '#3ecf8e',
      description: 'Supabase backend',
      actions: {
        'select': {
          id: 'select',
          name: 'Select Records',
          description: 'Query records from a table',
          parameters: [
            { name: 'table', type: 'string', label: 'Table Name', required: true },
            { name: 'columns', type: 'string', label: 'Columns (comma-separated)', placeholder: 'id, name, email' },
          ],
        },
        'insert': {
          id: 'insert',
          name: 'Insert Record',
          description: 'Insert a record',
          parameters: [
            { name: 'table', type: 'string', label: 'Table Name', required: true },
            { name: 'data', type: 'textarea', label: 'Data (JSON)', required: true },
          ],
        },
      },
    },
    firebase: {
      id: 'firebase',
      name: 'Firebase',
      icon: 'Flame',
      color: '#ffca28',
      description: 'Firebase services',
      actions: {
        'get': {
          id: 'get',
          name: 'Get Data',
          description: 'Get data from Firestore',
          parameters: [
            { name: 'path', type: 'string', label: 'Path', required: true, placeholder: 'users/user123' },
          ],
        },
        'set': {
          id: 'set',
          name: 'Set Data',
          description: 'Set data in Firestore',
          parameters: [
            { name: 'path', type: 'string', label: 'Path', required: true },
            { name: 'data', type: 'textarea', label: 'Data (JSON)', required: true },
          ],
        },
      },
    },
    redis: {
      id: 'redis',
      name: 'Redis',
      icon: 'Zap',
      color: '#dc382d',
      description: 'Redis cache',
      actions: {
        'get': {
          id: 'get',
          name: 'Get Value',
          description: 'Get a value from Redis',
          parameters: [
            { name: 'key', type: 'string', label: 'Key', required: true },
          ],
        },
        'set': {
          id: 'set',
          name: 'Set Value',
          description: 'Set a value in Redis',
          parameters: [
            { name: 'key', type: 'string', label: 'Key', required: true },
            { name: 'value', type: 'string', label: 'Value', required: true },
            { name: 'ttl', type: 'number', label: 'TTL (seconds)', placeholder: '3600' },
          ],
        },
      },
    },
  },
};

// Communication Integration
export const COMMUNICATION_INTEGRATIONS: IntegrationCategory = {
  id: 'communication',
  name: 'Communication Integration',
  description: 'Messaging and communication',
  icon: 'MessageSquare',
  color: '#4a154b',
  providers: {
    slack: {
      id: 'slack',
      name: 'Slack',
      icon: 'MessageSquare',
      color: '#4a154b',
      description: 'Slack messaging',
      actions: {
        'send-message': {
          id: 'send-message',
          name: 'Send Message',
          description: 'Send a message to a channel',
          parameters: [
            { name: 'channel', type: 'string', label: 'Channel', required: true, placeholder: '#general' },
            { name: 'text', type: 'textarea', label: 'Message', required: true },
          ],
        },
      },
    },
    discord: {
      id: 'discord',
      name: 'Discord',
      icon: 'MessageCircle',
      color: '#5865f2',
      description: 'Discord messaging',
      actions: {
        'send-message': {
          id: 'send-message',
          name: 'Send Message',
          description: 'Send a message to a channel',
          parameters: [
            { name: 'channel_id', type: 'string', label: 'Channel ID', required: true },
            { name: 'content', type: 'textarea', label: 'Message', required: true },
          ],
        },
      },
    },
    email: {
      id: 'email',
      name: 'Email',
      icon: 'Mail',
      color: '#ef4444',
      description: 'Send emails',
      actions: {
        'send-email': {
          id: 'send-email',
          name: 'Send Email',
          description: 'Send an email',
          parameters: [
            { name: 'to', type: 'string', label: 'To', required: true, placeholder: 'recipient@example.com' },
            { name: 'subject', type: 'string', label: 'Subject', required: true },
            { name: 'body', type: 'textarea', label: 'Body', required: true },
          ],
        },
      },
    },
    telegram: {
      id: 'telegram',
      name: 'Telegram',
      icon: 'Send',
      color: '#0088cc',
      description: 'Telegram messaging and bots',
      actions: {
        'send-message': {
          id: 'send-message',
          name: 'Send Message',
          description: 'Send a message via Telegram',
          parameters: [
            { name: 'chat_id', type: 'string', label: 'Chat ID', required: true, placeholder: 'User ID or channel username' },
            { name: 'text', type: 'textarea', label: 'Message', required: true },
            { name: 'parse_mode', type: 'select', label: 'Parse Mode', options: ['HTML', 'Markdown', 'None'], default: 'None' },
          ],
        },
        'send-photo': {
          id: 'send-photo',
          name: 'Send Photo',
          description: 'Send a photo via Telegram',
          parameters: [
            { name: 'chat_id', type: 'string', label: 'Chat ID', required: true },
            { name: 'photo', type: 'file', label: 'Photo', required: true },
            { name: 'caption', type: 'string', label: 'Caption' },
          ],
        },
      },
    },
    twilio: {
      id: 'twilio',
      name: 'Twilio',
      icon: 'Phone',
      color: '#f22f46',
      description: 'SMS, voice, and WhatsApp via Twilio',
      actions: {
        'send-sms': {
          id: 'send-sms',
          name: 'Send SMS',
          description: 'Send an SMS message',
          parameters: [
            { name: 'to', type: 'string', label: 'To (Phone Number)', required: true, placeholder: '+1234567890' },
            { name: 'from', type: 'string', label: 'From (Phone Number)', required: true, placeholder: '+1234567890' },
            { name: 'body', type: 'textarea', label: 'Message', required: true },
          ],
        },
        'make-call': {
          id: 'make-call',
          name: 'Make Voice Call',
          description: 'Make a voice call',
          parameters: [
            { name: 'to', type: 'string', label: 'To (Phone Number)', required: true, placeholder: '+1234567890' },
            { name: 'from', type: 'string', label: 'From (Phone Number)', required: true, placeholder: '+1234567890' },
            { name: 'url', type: 'string', label: 'Twiml URL', required: true, placeholder: 'URL to TwiML instructions' },
          ],
        },
        'send-whatsapp': {
          id: 'send-whatsapp',
          name: 'Send WhatsApp Message',
          description: 'Send a WhatsApp message via Twilio',
          parameters: [
            { name: 'to', type: 'string', label: 'To (WhatsApp Number)', required: true, placeholder: 'whatsapp:+1234567890' },
            { name: 'from', type: 'string', label: 'From (WhatsApp Number)', required: true, placeholder: 'whatsapp:+1234567890' },
            { name: 'body', type: 'textarea', label: 'Message', required: true },
          ],
        },
      },
    },
    'microsoft-teams': {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      icon: 'Users',
      color: '#6264a7',
      description: 'Microsoft Teams messaging and channels',
      actions: {
        'send-message': {
          id: 'send-message',
          name: 'Send Message',
          description: 'Send a message to a Teams channel or chat',
          parameters: [
            { name: 'channel_id', type: 'string', label: 'Channel ID', required: true, placeholder: 'Channel ID or chat ID' },
            { name: 'content', type: 'textarea', label: 'Message', required: true },
          ],
        },
        'create-meeting': {
          id: 'create-meeting',
          name: 'Create Meeting',
          description: 'Create a Teams meeting',
          parameters: [
            { name: 'subject', type: 'string', label: 'Subject', required: true },
            { name: 'start_time', type: 'string', label: 'Start Time', required: true, placeholder: 'YYYY-MM-DDTHH:MM:SS' },
            { name: 'end_time', type: 'string', label: 'End Time', required: true, placeholder: 'YYYY-MM-DDTHH:MM:SS' },
          ],
        },
      },
    },
    whatsapp: {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'MessageCircle',
      color: '#25d366',
      description: 'Send WhatsApp messages',
      actions: {
        'send-message': {
          id: 'send-message',
          name: 'Send Message',
          description: 'Send a WhatsApp message',
          parameters: [
            { name: 'to', type: 'string', label: 'To (Phone Number)', required: true, placeholder: '+1234567890' },
            { name: 'message', type: 'textarea', label: 'Message', required: true },
          ],
        },
        'send-media': {
          id: 'send-media',
          name: 'Send Media',
          description: 'Send media (image, video, document) via WhatsApp',
          parameters: [
            { name: 'to', type: 'string', label: 'To (Phone Number)', required: true, placeholder: '+1234567890' },
            { name: 'media_url', type: 'string', label: 'Media URL', required: true, placeholder: 'URL to media file' },
            { name: 'media_type', type: 'select', label: 'Media Type', required: true, options: ['image', 'video', 'document', 'audio'], default: 'image' },
            { name: 'caption', type: 'string', label: 'Caption' },
          ],
        },
      },
    },
  },
};

// Storage Integration
export const STORAGE_INTEGRATIONS: IntegrationCategory = {
  id: 'storage',
  name: 'Storage Integration',
  description: 'File and object storage services',
  icon: 'HardDrive',
  color: '#4285f4',
  providers: {
    'google-drive': {
      id: 'google-drive',
      name: 'Google Drive',
      icon: 'HardDrive',
      color: '#4285f4',
      description: 'Google Drive file storage',
      actions: {
        'upload-file': {
          id: 'upload-file',
          name: 'Upload File',
          description: 'Upload a file to Google Drive',
          parameters: [
            { name: 'file', type: 'file', label: 'File', required: true },
            { name: 'folder_id', type: 'string', label: 'Folder ID', placeholder: 'Leave empty for root' },
            { name: 'file_name', type: 'string', label: 'File Name' },
          ],
        },
        'download-file': {
          id: 'download-file',
          name: 'Download File',
          description: 'Download a file from Google Drive',
          parameters: [
            { name: 'file_id', type: 'string', label: 'File ID', required: true },
          ],
        },
        'list-files': {
          id: 'list-files',
          name: 'List Files',
          description: 'List files in a folder',
          parameters: [
            { name: 'folder_id', type: 'string', label: 'Folder ID', placeholder: 'Leave empty for root' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'delete-file': {
          id: 'delete-file',
          name: 'Delete File',
          description: 'Delete a file',
          parameters: [
            { name: 'file_id', type: 'string', label: 'File ID', required: true },
          ],
        },
      },
    },
    dropbox: {
      id: 'dropbox',
      name: 'Dropbox',
      icon: 'Droplet',
      color: '#0061ff',
      description: 'Dropbox file storage',
      actions: {
        'upload-file': {
          id: 'upload-file',
          name: 'Upload File',
          description: 'Upload a file to Dropbox',
          parameters: [
            { name: 'file', type: 'file', label: 'File', required: true },
            { name: 'path', type: 'string', label: 'Path', required: true, placeholder: '/folder/file.txt' },
          ],
        },
        'download-file': {
          id: 'download-file',
          name: 'Download File',
          description: 'Download a file from Dropbox',
          parameters: [
            { name: 'path', type: 'string', label: 'Path', required: true, placeholder: '/folder/file.txt' },
          ],
        },
        'list-files': {
          id: 'list-files',
          name: 'List Files',
          description: 'List files in a folder',
          parameters: [
            { name: 'path', type: 'string', label: 'Path', placeholder: '/folder' },
          ],
        },
        'delete-file': {
          id: 'delete-file',
          name: 'Delete File',
          description: 'Delete a file',
          parameters: [
            { name: 'path', type: 'string', label: 'Path', required: true, placeholder: '/folder/file.txt' },
          ],
        },
      },
    },
    'aws-s3': {
      id: 'aws-s3',
      name: 'AWS S3',
      icon: 'Box',
      color: '#ff9900',
      description: 'AWS S3 object storage',
      actions: {
        'upload-object': {
          id: 'upload-object',
          name: 'Upload Object',
          description: 'Upload an object to S3',
          parameters: [
            { name: 'bucket', type: 'string', label: 'Bucket Name', required: true },
            { name: 'key', type: 'string', label: 'Object Key', required: true, placeholder: 'folder/file.txt' },
            { name: 'file', type: 'file', label: 'File', required: true },
            { name: 'content_type', type: 'string', label: 'Content Type', placeholder: 'text/plain' },
          ],
        },
        'download-object': {
          id: 'download-object',
          name: 'Download Object',
          description: 'Download an object from S3',
          parameters: [
            { name: 'bucket', type: 'string', label: 'Bucket Name', required: true },
            { name: 'key', type: 'string', label: 'Object Key', required: true, placeholder: 'folder/file.txt' },
          ],
        },
        'list-objects': {
          id: 'list-objects',
          name: 'List Objects',
          description: 'List objects in a bucket',
          parameters: [
            { name: 'bucket', type: 'string', label: 'Bucket Name', required: true },
            { name: 'prefix', type: 'string', label: 'Prefix (folder path)', placeholder: 'folder/' },
            { name: 'limit', type: 'number', label: 'Limit', default: 100 },
          ],
        },
        'delete-object': {
          id: 'delete-object',
          name: 'Delete Object',
          description: 'Delete an object from S3',
          parameters: [
            { name: 'bucket', type: 'string', label: 'Bucket Name', required: true },
            { name: 'key', type: 'string', label: 'Object Key', required: true, placeholder: 'folder/file.txt' },
          ],
        },
      },
    },
    onedrive: {
      id: 'onedrive',
      name: 'OneDrive',
      icon: 'Cloud',
      color: '#0078d4',
      description: 'Microsoft OneDrive storage',
      actions: {
        'upload-file': {
          id: 'upload-file',
          name: 'Upload File',
          description: 'Upload a file to OneDrive',
          parameters: [
            { name: 'file', type: 'file', label: 'File', required: true },
            { name: 'path', type: 'string', label: 'Path', required: true, placeholder: '/folder/file.txt' },
          ],
        },
        'download-file': {
          id: 'download-file',
          name: 'Download File',
          description: 'Download a file from OneDrive',
          parameters: [
            { name: 'file_id', type: 'string', label: 'File ID', required: true },
          ],
        },
        'list-files': {
          id: 'list-files',
          name: 'List Files',
          description: 'List files in a folder',
          parameters: [
            { name: 'folder_id', type: 'string', label: 'Folder ID', placeholder: 'Leave empty for root' },
          ],
        },
        'delete-file': {
          id: 'delete-file',
          name: 'Delete File',
          description: 'Delete a file',
          parameters: [
            { name: 'file_id', type: 'string', label: 'File ID', required: true },
          ],
        },
      },
    },
    ftp: {
      id: 'ftp',
      name: 'FTP/SFTP',
      icon: 'FolderSync',
      color: '#607d8b',
      description: 'FTP and SFTP file transfer',
      actions: {
        'upload-file': {
          id: 'upload-file',
          name: 'Upload File',
          description: 'Upload a file via FTP/SFTP',
          parameters: [
            { name: 'file', type: 'file', label: 'File', required: true },
            { name: 'remote_path', type: 'string', label: 'Remote Path', required: true, placeholder: '/folder/file.txt' },
          ],
        },
        'download-file': {
          id: 'download-file',
          name: 'Download File',
          description: 'Download a file via FTP/SFTP',
          parameters: [
            { name: 'remote_path', type: 'string', label: 'Remote Path', required: true, placeholder: '/folder/file.txt' },
            { name: 'local_path', type: 'string', label: 'Local Path', placeholder: 'Where to save the file' },
          ],
        },
        'list-files': {
          id: 'list-files',
          name: 'List Files',
          description: 'List files in a directory',
          parameters: [
            { name: 'remote_path', type: 'string', label: 'Remote Path', placeholder: '/folder' },
          ],
        },
        'delete-file': {
          id: 'delete-file',
          name: 'Delete File',
          description: 'Delete a file via FTP/SFTP',
          parameters: [
            { name: 'remote_path', type: 'string', label: 'Remote Path', required: true, placeholder: '/folder/file.txt' },
          ],
        },
      },
    },
  },
};

// Social Media Integration
export const SOCIAL_MEDIA_INTEGRATIONS: IntegrationCategory = {
  id: 'social-media',
  name: 'Social Media Integration',
  description: 'Social media platforms and posting',
  icon: 'Twitter',
  color: '#1da1f2',
  providers: {
    twitter: {
      id: 'twitter',
      name: 'Twitter/X',
      icon: 'Twitter',
      color: '#000000',
      description: 'Twitter/X social media',
      actions: {
        'post-tweet': {
          id: 'post-tweet',
          name: 'Post Tweet',
          description: 'Post a tweet',
          parameters: [
            { name: 'text', type: 'textarea', label: 'Tweet Text', required: true, placeholder: 'What\'s happening?' },
            { name: 'media_urls', type: 'string', label: 'Media URLs (comma-separated)', placeholder: 'url1, url2' },
            { name: 'reply_to', type: 'string', label: 'Reply To Tweet ID', placeholder: 'Tweet ID to reply to' },
          ],
        },
        'get-timeline': {
          id: 'get-timeline',
          name: 'Get Timeline',
          description: 'Get user timeline',
          parameters: [
            { name: 'user_id', type: 'string', label: 'User ID', placeholder: 'Leave empty for authenticated user' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'like-tweet': {
          id: 'like-tweet',
          name: 'Like Tweet',
          description: 'Like a tweet',
          parameters: [
            { name: 'tweet_id', type: 'string', label: 'Tweet ID', required: true },
          ],
        },
        'retweet': {
          id: 'retweet',
          name: 'Retweet',
          description: 'Retweet a tweet',
          parameters: [
            { name: 'tweet_id', type: 'string', label: 'Tweet ID', required: true },
          ],
        },
        'get-profile': {
          id: 'get-profile',
          name: 'Get User Profile',
          description: 'Get user profile information',
          parameters: [
            { name: 'username', type: 'string', label: 'Username', placeholder: '@username or user ID' },
          ],
        },
        'send-dm': {
          id: 'send-dm',
          name: 'Send Direct Message',
          description: 'Send a direct message',
          parameters: [
            { name: 'to', type: 'string', label: 'To (User ID)', required: true },
            { name: 'message', type: 'textarea', label: 'Message', required: true },
          ],
        },
      },
    },
    linkedin: {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: 'Linkedin',
      color: '#0a66c2',
      description: 'LinkedIn professional network',
      actions: {
        'post-update': {
          id: 'post-update',
          name: 'Post Update',
          description: 'Post an update to LinkedIn',
          parameters: [
            { name: 'text', type: 'textarea', label: 'Post Text', required: true },
            { name: 'media_url', type: 'string', label: 'Media URL', placeholder: 'URL to image/video' },
          ],
        },
        'share-article': {
          id: 'share-article',
          name: 'Share Article',
          description: 'Share an article link',
          parameters: [
            { name: 'url', type: 'string', label: 'Article URL', required: true },
            { name: 'comment', type: 'textarea', label: 'Comment', placeholder: 'Your comment about the article' },
          ],
        },
        'get-feed': {
          id: 'get-feed',
          name: 'Get Feed',
          description: 'Get LinkedIn feed',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'like-post': {
          id: 'like-post',
          name: 'Like Post',
          description: 'Like a LinkedIn post',
          parameters: [
            { name: 'post_id', type: 'string', label: 'Post ID', required: true },
          ],
        },
        'comment-post': {
          id: 'comment-post',
          name: 'Comment on Post',
          description: 'Comment on a LinkedIn post',
          parameters: [
            { name: 'post_id', type: 'string', label: 'Post ID', required: true },
            { name: 'comment', type: 'textarea', label: 'Comment', required: true },
          ],
        },
        'get-profile': {
          id: 'get-profile',
          name: 'Get Profile',
          description: 'Get LinkedIn profile',
          parameters: [
            { name: 'profile_id', type: 'string', label: 'Profile ID', placeholder: 'Leave empty for authenticated user' },
          ],
        },
      },
    },
    facebook: {
      id: 'facebook',
      name: 'Facebook',
      icon: 'Facebook',
      color: '#1877f2',
      description: 'Facebook pages and posts',
      actions: {
        'post-to-page': {
          id: 'post-to-page',
          name: 'Post to Page',
          description: 'Post to a Facebook page',
          parameters: [
            { name: 'page_id', type: 'string', label: 'Page ID', required: true },
            { name: 'message', type: 'textarea', label: 'Message', required: true },
            { name: 'media_url', type: 'string', label: 'Media URL', placeholder: 'URL to image/video' },
          ],
        },
        'get-page-posts': {
          id: 'get-page-posts',
          name: 'Get Page Posts',
          description: 'Get posts from a Facebook page',
          parameters: [
            { name: 'page_id', type: 'string', label: 'Page ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'like-post': {
          id: 'like-post',
          name: 'Like Post',
          description: 'Like a Facebook post',
          parameters: [
            { name: 'post_id', type: 'string', label: 'Post ID', required: true },
          ],
        },
        'comment-post': {
          id: 'comment-post',
          name: 'Comment on Post',
          description: 'Comment on a Facebook post',
          parameters: [
            { name: 'post_id', type: 'string', label: 'Post ID', required: true },
            { name: 'message', type: 'textarea', label: 'Comment', required: true },
          ],
        },
        'get-page-insights': {
          id: 'get-page-insights',
          name: 'Get Page Insights',
          description: 'Get Facebook page analytics',
          parameters: [
            { name: 'page_id', type: 'string', label: 'Page ID', required: true },
            { name: 'metrics', type: 'string', label: 'Metrics (comma-separated)', placeholder: 'page_impressions, page_reach' },
          ],
        },
      },
    },
    instagram: {
      id: 'instagram',
      name: 'Instagram',
      icon: 'Instagram',
      color: '#e4405f',
      description: 'Instagram photos and videos',
      actions: {
        'post-photo': {
          id: 'post-photo',
          name: 'Post Photo',
          description: 'Post a photo to Instagram',
          parameters: [
            { name: 'image_url', type: 'string', label: 'Image URL', required: true, placeholder: 'URL to image' },
            { name: 'caption', type: 'textarea', label: 'Caption', placeholder: 'Photo caption' },
          ],
        },
        'post-video': {
          id: 'post-video',
          name: 'Post Video',
          description: 'Post a video to Instagram',
          parameters: [
            { name: 'video_url', type: 'string', label: 'Video URL', required: true, placeholder: 'URL to video' },
            { name: 'caption', type: 'textarea', label: 'Caption', placeholder: 'Video caption' },
          ],
        },
        'get-feed': {
          id: 'get-feed',
          name: 'Get Feed',
          description: 'Get Instagram feed',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'like-post': {
          id: 'like-post',
          name: 'Like Post',
          description: 'Like an Instagram post',
          parameters: [
            { name: 'media_id', type: 'string', label: 'Media ID', required: true },
          ],
        },
        'comment-post': {
          id: 'comment-post',
          name: 'Comment on Post',
          description: 'Comment on an Instagram post',
          parameters: [
            { name: 'media_id', type: 'string', label: 'Media ID', required: true },
            { name: 'text', type: 'textarea', label: 'Comment', required: true },
          ],
        },
        'get-profile': {
          id: 'get-profile',
          name: 'Get User Profile',
          description: 'Get Instagram user profile',
          parameters: [
            { name: 'username', type: 'string', label: 'Username', placeholder: 'Leave empty for authenticated user' },
          ],
        },
      },
    },
    youtube: {
      id: 'youtube',
      name: 'YouTube',
      icon: 'Youtube',
      color: '#ff0000',
      description: 'YouTube videos and channels',
      actions: {
        'upload-video': {
          id: 'upload-video',
          name: 'Upload Video',
          description: 'Upload a video to YouTube',
          parameters: [
            { name: 'video_file', type: 'file', label: 'Video File', required: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'description', type: 'textarea', label: 'Description' },
            { name: 'privacy', type: 'select', label: 'Privacy', options: ['public', 'unlisted', 'private'], default: 'public' },
            { name: 'tags', type: 'string', label: 'Tags (comma-separated)', placeholder: 'tag1, tag2, tag3' },
          ],
        },
        'get-videos': {
          id: 'get-videos',
          name: 'Get Videos',
          description: 'Get videos from a channel',
          parameters: [
            { name: 'channel_id', type: 'string', label: 'Channel ID', placeholder: 'Leave empty for authenticated user' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-video-details': {
          id: 'get-video-details',
          name: 'Get Video Details',
          description: 'Get details of a specific video',
          parameters: [
            { name: 'video_id', type: 'string', label: 'Video ID', required: true },
          ],
        },
        'get-channel-stats': {
          id: 'get-channel-stats',
          name: 'Get Channel Stats',
          description: 'Get channel statistics',
          parameters: [
            { name: 'channel_id', type: 'string', label: 'Channel ID', placeholder: 'Leave empty for authenticated user' },
          ],
        },
        'add-comment': {
          id: 'add-comment',
          name: 'Add Comment',
          description: 'Add a comment to a video',
          parameters: [
            { name: 'video_id', type: 'string', label: 'Video ID', required: true },
            { name: 'text', type: 'textarea', label: 'Comment', required: true },
          ],
        },
      },
    },
    tiktok: {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'Music',
      color: '#000000',
      description: 'TikTok videos',
      actions: {
        'upload-video': {
          id: 'upload-video',
          name: 'Upload Video',
          description: 'Upload a video to TikTok',
          parameters: [
            { name: 'video_file', type: 'file', label: 'Video File', required: true },
            { name: 'caption', type: 'textarea', label: 'Caption', placeholder: 'Video caption' },
            { name: 'privacy', type: 'select', label: 'Privacy', options: ['public', 'friends', 'private'], default: 'public' },
          ],
        },
        'get-user-videos': {
          id: 'get-user-videos',
          name: 'Get User Videos',
          description: 'Get videos from a user',
          parameters: [
            { name: 'username', type: 'string', label: 'Username', placeholder: 'Leave empty for authenticated user' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-video-stats': {
          id: 'get-video-stats',
          name: 'Get Video Stats',
          description: 'Get statistics for a video',
          parameters: [
            { name: 'video_id', type: 'string', label: 'Video ID', required: true },
          ],
        },
        'like-video': {
          id: 'like-video',
          name: 'Like Video',
          description: 'Like a TikTok video',
          parameters: [
            { name: 'video_id', type: 'string', label: 'Video ID', required: true },
          ],
        },
      },
    },
    reddit: {
      id: 'reddit',
      name: 'Reddit',
      icon: 'MessageSquare',
      color: '#ff4500',
      description: 'Reddit posts and comments',
      actions: {
        'post-to-subreddit': {
          id: 'post-to-subreddit',
          name: 'Post to Subreddit',
          description: 'Post to a subreddit',
          parameters: [
            { name: 'subreddit', type: 'string', label: 'Subreddit', required: true, placeholder: 'subreddit name' },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'text', type: 'textarea', label: 'Text (for text post)', placeholder: 'Post content' },
            { name: 'url', type: 'string', label: 'URL (for link post)', placeholder: 'URL to share' },
          ],
        },
        'get-posts': {
          id: 'get-posts',
          name: 'Get Posts',
          description: 'Get posts from a subreddit',
          parameters: [
            { name: 'subreddit', type: 'string', label: 'Subreddit', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
            { name: 'sort', type: 'select', label: 'Sort', options: ['hot', 'new', 'top', 'rising'], default: 'hot' },
          ],
        },
        'upvote': {
          id: 'upvote',
          name: 'Upvote',
          description: 'Upvote a post or comment',
          parameters: [
            { name: 'post_id', type: 'string', label: 'Post/Comment ID', required: true },
          ],
        },
        'downvote': {
          id: 'downvote',
          name: 'Downvote',
          description: 'Downvote a post or comment',
          parameters: [
            { name: 'post_id', type: 'string', label: 'Post/Comment ID', required: true },
          ],
        },
        'comment': {
          id: 'comment',
          name: 'Comment',
          description: 'Comment on a post',
          parameters: [
            { name: 'post_id', type: 'string', label: 'Post ID', required: true },
            { name: 'text', type: 'textarea', label: 'Comment', required: true },
          ],
        },
      },
    },
  },
};

// CRM Integration
export const CRM_INTEGRATIONS: IntegrationCategory = {
  id: 'crm',
  name: 'CRM Integration',
  description: 'Customer relationship management platforms',
  icon: 'Users',
  color: '#00a1e0',
  providers: {
    salesforce: {
      id: 'salesforce',
      name: 'Salesforce',
      icon: 'Cloud',
      color: '#00a1e0',
      description: 'Salesforce CRM',
      actions: {
        'get-contact': {
          id: 'get-contact',
          name: 'Get Contact',
          description: 'Retrieve a contact',
          parameters: [
            { name: 'contact_id', type: 'string', label: 'Contact ID', required: true, placeholder: '003...' },
          ],
        },
        'create-contact': {
          id: 'create-contact',
          name: 'Create Contact',
          description: 'Create a new contact',
          parameters: [
            { name: 'first_name', type: 'string', label: 'First Name', required: true },
            { name: 'last_name', type: 'string', label: 'Last Name', required: true },
            { name: 'email', type: 'string', label: 'Email', required: true },
            { name: 'phone', type: 'string', label: 'Phone' },
            { name: 'company', type: 'string', label: 'Company' },
          ],
        },
        'update-contact': {
          id: 'update-contact',
          name: 'Update Contact',
          description: 'Update an existing contact',
          parameters: [
            { name: 'contact_id', type: 'string', label: 'Contact ID', required: true },
            { name: 'email', type: 'string', label: 'Email' },
            { name: 'phone', type: 'string', label: 'Phone' },
            { name: 'company', type: 'string', label: 'Company' },
          ],
        },
        'create-deal': {
          id: 'create-deal',
          name: 'Create Deal',
          description: 'Create a new opportunity/deal',
          parameters: [
            { name: 'name', type: 'string', label: 'Deal Name', required: true },
            { name: 'amount', type: 'number', label: 'Amount', required: true },
            { name: 'stage', type: 'select', label: 'Stage', options: ['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Id. Decision Makers', 'Perception Analysis', 'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost'], default: 'Prospecting' },
            { name: 'contact_id', type: 'string', label: 'Contact ID' },
          ],
        },
        'get-opportunities': {
          id: 'get-opportunities',
          name: 'Get Opportunities',
          description: 'Retrieve opportunities',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
            { name: 'stage', type: 'string', label: 'Stage Filter' },
          ],
        },
      },
    },
    hubspot: {
      id: 'hubspot',
      name: 'HubSpot',
      icon: 'Target',
      color: '#ff7a59',
      description: 'HubSpot CRM',
      actions: {
        'get-contact': {
          id: 'get-contact',
          name: 'Get Contact',
          description: 'Retrieve a contact',
          parameters: [
            { name: 'contact_id', type: 'string', label: 'Contact ID', required: true },
          ],
        },
        'create-contact': {
          id: 'create-contact',
          name: 'Create Contact',
          description: 'Create a new contact',
          parameters: [
            { name: 'email', type: 'string', label: 'Email', required: true },
            { name: 'first_name', type: 'string', label: 'First Name' },
            { name: 'last_name', type: 'string', label: 'Last Name' },
            { name: 'phone', type: 'string', label: 'Phone' },
            { name: 'company', type: 'string', label: 'Company' },
          ],
        },
        'update-contact': {
          id: 'update-contact',
          name: 'Update Contact',
          description: 'Update an existing contact',
          parameters: [
            { name: 'contact_id', type: 'string', label: 'Contact ID', required: true },
            { name: 'email', type: 'string', label: 'Email' },
            { name: 'phone', type: 'string', label: 'Phone' },
            { name: 'company', type: 'string', label: 'Company' },
          ],
        },
        'create-deal': {
          id: 'create-deal',
          name: 'Create Deal',
          description: 'Create a new deal',
          parameters: [
            { name: 'deal_name', type: 'string', label: 'Deal Name', required: true },
            { name: 'amount', type: 'number', label: 'Amount', required: true },
            { name: 'deal_stage', type: 'select', label: 'Deal Stage', options: ['appointmentscheduled', 'qualifiedtobuy', 'presentationscheduled', 'decisionmakerboughtin', 'contractsent', 'closedwon', 'closedlost'], default: 'appointmentscheduled' },
            { name: 'contact_id', type: 'string', label: 'Contact ID' },
          ],
        },
        'get-deals': {
          id: 'get-deals',
          name: 'Get Deals',
          description: 'Retrieve deals',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
    pipedrive: {
      id: 'pipedrive',
      name: 'Pipedrive',
      icon: 'TrendingUp',
      color: '#017737',
      description: 'Pipedrive CRM',
      actions: {
        'get-person': {
          id: 'get-person',
          name: 'Get Person',
          description: 'Retrieve a person',
          parameters: [
            { name: 'person_id', type: 'string', label: 'Person ID', required: true },
          ],
        },
        'create-person': {
          id: 'create-person',
          name: 'Create Person',
          description: 'Create a new person',
          parameters: [
            { name: 'name', type: 'string', label: 'Name', required: true },
            { name: 'email', type: 'string', label: 'Email' },
            { name: 'phone', type: 'string', label: 'Phone' },
            { name: 'org_id', type: 'string', label: 'Organization ID' },
          ],
        },
        'update-person': {
          id: 'update-person',
          name: 'Update Person',
          description: 'Update an existing person',
          parameters: [
            { name: 'person_id', type: 'string', label: 'Person ID', required: true },
            { name: 'email', type: 'string', label: 'Email' },
            { name: 'phone', type: 'string', label: 'Phone' },
          ],
        },
        'create-deal': {
          id: 'create-deal',
          name: 'Create Deal',
          description: 'Create a new deal',
          parameters: [
            { name: 'title', type: 'string', label: 'Deal Title', required: true },
            { name: 'value', type: 'number', label: 'Value', required: true },
            { name: 'currency', type: 'string', label: 'Currency', default: 'USD' },
            { name: 'person_id', type: 'string', label: 'Person ID' },
            { name: 'stage_id', type: 'string', label: 'Stage ID' },
          ],
        },
        'get-deals': {
          id: 'get-deals',
          name: 'Get Deals',
          description: 'Retrieve deals',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
            { name: 'status', type: 'select', label: 'Status', options: ['open', 'won', 'lost'], default: 'open' },
          ],
        },
      },
    },
    'zoho-crm': {
      id: 'zoho-crm',
      name: 'Zoho CRM',
      icon: 'Building2',
      color: '#e42527',
      description: 'Zoho CRM',
      actions: {
        'get-contact': {
          id: 'get-contact',
          name: 'Get Contact',
          description: 'Retrieve a contact',
          parameters: [
            { name: 'contact_id', type: 'string', label: 'Contact ID', required: true },
          ],
        },
        'create-contact': {
          id: 'create-contact',
          name: 'Create Contact',
          description: 'Create a new contact',
          parameters: [
            { name: 'first_name', type: 'string', label: 'First Name', required: true },
            { name: 'last_name', type: 'string', label: 'Last Name', required: true },
            { name: 'email', type: 'string', label: 'Email', required: true },
            { name: 'phone', type: 'string', label: 'Phone' },
            { name: 'account_name', type: 'string', label: 'Account Name' },
          ],
        },
        'update-contact': {
          id: 'update-contact',
          name: 'Update Contact',
          description: 'Update an existing contact',
          parameters: [
            { name: 'contact_id', type: 'string', label: 'Contact ID', required: true },
            { name: 'email', type: 'string', label: 'Email' },
            { name: 'phone', type: 'string', label: 'Phone' },
          ],
        },
        'create-deal': {
          id: 'create-deal',
          name: 'Create Deal',
          description: 'Create a new deal',
          parameters: [
            { name: 'deal_name', type: 'string', label: 'Deal Name', required: true },
            { name: 'amount', type: 'number', label: 'Amount', required: true },
            { name: 'stage', type: 'select', label: 'Stage', options: ['Qualification', 'Needs Analysis', 'Value Proposition', 'Id. Decision Makers', 'Perception Analysis', 'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost'], default: 'Qualification' },
            { name: 'contact_id', type: 'string', label: 'Contact ID' },
          ],
        },
        'get-deals': {
          id: 'get-deals',
          name: 'Get Deals',
          description: 'Retrieve deals',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
    freshsales: {
      id: 'freshsales',
      name: 'Freshsales',
      icon: 'UserCheck',
      color: '#13ae7b',
      description: 'Freshsales CRM',
      actions: {
        'get-contact': {
          id: 'get-contact',
          name: 'Get Contact',
          description: 'Retrieve a contact',
          parameters: [
            { name: 'contact_id', type: 'string', label: 'Contact ID', required: true },
          ],
        },
        'create-contact': {
          id: 'create-contact',
          name: 'Create Contact',
          description: 'Create a new contact',
          parameters: [
            { name: 'first_name', type: 'string', label: 'First Name', required: true },
            { name: 'last_name', type: 'string', label: 'Last Name', required: true },
            { name: 'email', type: 'string', label: 'Email', required: true },
            { name: 'phone', type: 'string', label: 'Phone' },
            { name: 'company_name', type: 'string', label: 'Company Name' },
          ],
        },
        'update-contact': {
          id: 'update-contact',
          name: 'Update Contact',
          description: 'Update an existing contact',
          parameters: [
            { name: 'contact_id', type: 'string', label: 'Contact ID', required: true },
            { name: 'email', type: 'string', label: 'Email' },
            { name: 'phone', type: 'string', label: 'Phone' },
            { name: 'company_name', type: 'string', label: 'Company Name' },
          ],
        },
        'create-deal': {
          id: 'create-deal',
          name: 'Create Deal',
          description: 'Create a new deal',
          parameters: [
            { name: 'name', type: 'string', label: 'Deal Name', required: true },
            { name: 'amount', type: 'number', label: 'Amount', required: true },
            { name: 'stage_id', type: 'string', label: 'Stage ID', required: true },
            { name: 'contact_id', type: 'string', label: 'Contact ID' },
          ],
        },
        'get-deals': {
          id: 'get-deals',
          name: 'Get Deals',
          description: 'Retrieve deals',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
  },
};

// Productivity Integration
export const PRODUCTIVITY_INTEGRATIONS: IntegrationCategory = {
  id: 'productivity',
  name: 'Productivity Integration',
  description: 'Productivity and collaboration tools',
  icon: 'Briefcase',
  color: '#4285f4',
  providers: {
    'google-sheets': {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: 'Table',
      color: '#34a853',
      description: 'Google Sheets spreadsheets',
      actions: {
        'read-range': {
          id: 'read-range',
          name: 'Read Range',
          description: 'Read data from a range',
          parameters: [
            { name: 'spreadsheet_id', type: 'string', label: 'Spreadsheet ID', required: true },
            { name: 'range', type: 'string', label: 'Range', required: true, placeholder: 'Sheet1!A1:B10' },
          ],
        },
        'write-range': {
          id: 'write-range',
          name: 'Write Range',
          description: 'Write data to a range',
          parameters: [
            { name: 'spreadsheet_id', type: 'string', label: 'Spreadsheet ID', required: true },
            { name: 'range', type: 'string', label: 'Range', required: true, placeholder: 'Sheet1!A1' },
            { name: 'values', type: 'textarea', label: 'Values (JSON array)', required: true, placeholder: '[["Name", "Email"], ["John", "john@example.com"]]' },
          ],
        },
        'append-row': {
          id: 'append-row',
          name: 'Append Row',
          description: 'Append a row to a sheet',
          parameters: [
            { name: 'spreadsheet_id', type: 'string', label: 'Spreadsheet ID', required: true },
            { name: 'sheet_name', type: 'string', label: 'Sheet Name', required: true },
            { name: 'values', type: 'textarea', label: 'Values (JSON array)', required: true, placeholder: '["John", "john@example.com"]' },
          ],
        },
      },
    },
    'google-docs': {
      id: 'google-docs',
      name: 'Google Docs',
      icon: 'FileText',
      color: '#4285f4',
      description: 'Google Docs documents',
      actions: {
        'create-document': {
          id: 'create-document',
          name: 'Create Document',
          description: 'Create a new document',
          parameters: [
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'content', type: 'textarea', label: 'Content' },
          ],
        },
        'get-document': {
          id: 'get-document',
          name: 'Get Document',
          description: 'Retrieve document content',
          parameters: [
            { name: 'document_id', type: 'string', label: 'Document ID', required: true },
          ],
        },
        'update-document': {
          id: 'update-document',
          name: 'Update Document',
          description: 'Update document content',
          parameters: [
            { name: 'document_id', type: 'string', label: 'Document ID', required: true },
            { name: 'content', type: 'textarea', label: 'Content', required: true },
          ],
        },
      },
    },
    'google-calendar': {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: 'Calendar',
      color: '#4285f4',
      description: 'Google Calendar events',
      actions: {
        'create-event': {
          id: 'create-event',
          name: 'Create Event',
          description: 'Create a calendar event',
          parameters: [
            { name: 'summary', type: 'string', label: 'Event Title', required: true },
            { name: 'start_time', type: 'string', label: 'Start Time', required: true, placeholder: '2024-01-01T10:00:00' },
            { name: 'end_time', type: 'string', label: 'End Time', required: true, placeholder: '2024-01-01T11:00:00' },
            { name: 'description', type: 'textarea', label: 'Description' },
            { name: 'location', type: 'string', label: 'Location' },
          ],
        },
        'get-events': {
          id: 'get-events',
          name: 'Get Events',
          description: 'Retrieve calendar events',
          parameters: [
            { name: 'calendar_id', type: 'string', label: 'Calendar ID', placeholder: 'primary' },
            { name: 'time_min', type: 'string', label: 'Start Time', placeholder: '2024-01-01T00:00:00' },
            { name: 'time_max', type: 'string', label: 'End Time', placeholder: '2024-01-31T23:59:59' },
          ],
        },
        'update-event': {
          id: 'update-event',
          name: 'Update Event',
          description: 'Update an existing event',
          parameters: [
            { name: 'event_id', type: 'string', label: 'Event ID', required: true },
            { name: 'summary', type: 'string', label: 'Event Title' },
            { name: 'start_time', type: 'string', label: 'Start Time', placeholder: '2024-01-01T10:00:00' },
            { name: 'end_time', type: 'string', label: 'End Time', placeholder: '2024-01-01T11:00:00' },
          ],
        },
      },
    },
    notion: {
      id: 'notion',
      name: 'Notion',
      icon: 'BookOpen',
      color: '#000000',
      description: 'Notion pages and databases',
      actions: {
        'create-page': {
          id: 'create-page',
          name: 'Create Page',
          description: 'Create a new page',
          parameters: [
            { name: 'parent_id', type: 'string', label: 'Parent Page ID', required: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'content', type: 'textarea', label: 'Content (Markdown)' },
          ],
        },
        'get-page': {
          id: 'get-page',
          name: 'Get Page',
          description: 'Retrieve a page',
          parameters: [
            { name: 'page_id', type: 'string', label: 'Page ID', required: true },
          ],
        },
        'update-page': {
          id: 'update-page',
          name: 'Update Page',
          description: 'Update a page',
          parameters: [
            { name: 'page_id', type: 'string', label: 'Page ID', required: true },
            { name: 'title', type: 'string', label: 'Title' },
            { name: 'content', type: 'textarea', label: 'Content (Markdown)' },
          ],
        },
        'query-database': {
          id: 'query-database',
          name: 'Query Database',
          description: 'Query a database',
          parameters: [
            { name: 'database_id', type: 'string', label: 'Database ID', required: true },
            { name: 'filter', type: 'textarea', label: 'Filter (JSON)', placeholder: '{"property": "Status", "select": {"equals": "Done"}}' },
          ],
        },
      },
    },
    airtable: {
      id: 'airtable',
      name: 'Airtable',
      icon: 'Grid3X3',
      color: '#18bfff',
      description: 'Airtable bases and tables',
      actions: {
        'get-record': {
          id: 'get-record',
          name: 'Get Record',
          description: 'Retrieve a record',
          parameters: [
            { name: 'base_id', type: 'string', label: 'Base ID', required: true },
            { name: 'table_name', type: 'string', label: 'Table Name', required: true },
            { name: 'record_id', type: 'string', label: 'Record ID', required: true },
          ],
        },
        'create-record': {
          id: 'create-record',
          name: 'Create Record',
          description: 'Create a new record',
          parameters: [
            { name: 'base_id', type: 'string', label: 'Base ID', required: true },
            { name: 'table_name', type: 'string', label: 'Table Name', required: true },
            { name: 'fields', type: 'textarea', label: 'Fields (JSON)', required: true, placeholder: '{"Name": "John", "Email": "john@example.com"}' },
          ],
        },
        'update-record': {
          id: 'update-record',
          name: 'Update Record',
          description: 'Update a record',
          parameters: [
            { name: 'base_id', type: 'string', label: 'Base ID', required: true },
            { name: 'table_name', type: 'string', label: 'Table Name', required: true },
            { name: 'record_id', type: 'string', label: 'Record ID', required: true },
            { name: 'fields', type: 'textarea', label: 'Fields (JSON)', required: true },
          ],
        },
        'list-records': {
          id: 'list-records',
          name: 'List Records',
          description: 'List records from a table',
          parameters: [
            { name: 'base_id', type: 'string', label: 'Base ID', required: true },
            { name: 'table_name', type: 'string', label: 'Table Name', required: true },
            { name: 'max_records', type: 'number', label: 'Max Records', default: 10 },
          ],
        },
      },
    },
    excel: {
      id: 'excel',
      name: 'Microsoft Excel',
      icon: 'Table',
      color: '#217346',
      description: 'Microsoft Excel spreadsheets',
      actions: {
        'read-range': {
          id: 'read-range',
          name: 'Read Range',
          description: 'Read data from a range',
          parameters: [
            { name: 'workbook_id', type: 'string', label: 'Workbook ID', required: true },
            { name: 'worksheet_name', type: 'string', label: 'Worksheet Name', required: true },
            { name: 'range', type: 'string', label: 'Range', required: true, placeholder: 'A1:B10' },
          ],
        },
        'write-range': {
          id: 'write-range',
          name: 'Write Range',
          description: 'Write data to a range',
          parameters: [
            { name: 'workbook_id', type: 'string', label: 'Workbook ID', required: true },
            { name: 'worksheet_name', type: 'string', label: 'Worksheet Name', required: true },
            { name: 'range', type: 'string', label: 'Range', required: true },
            { name: 'values', type: 'textarea', label: 'Values (JSON array)', required: true },
          ],
        },
      },
    },
    trello: {
      id: 'trello',
      name: 'Trello',
      icon: 'LayoutGrid',
      color: '#0052cc',
      description: 'Trello boards and cards',
      actions: {
        'create-card': {
          id: 'create-card',
          name: 'Create Card',
          description: 'Create a new card',
          parameters: [
            { name: 'board_id', type: 'string', label: 'Board ID', required: true },
            { name: 'list_id', type: 'string', label: 'List ID', required: true },
            { name: 'name', type: 'string', label: 'Card Name', required: true },
            { name: 'description', type: 'textarea', label: 'Description' },
          ],
        },
        'get-cards': {
          id: 'get-cards',
          name: 'Get Cards',
          description: 'Retrieve cards from a list',
          parameters: [
            { name: 'list_id', type: 'string', label: 'List ID', required: true },
          ],
        },
        'update-card': {
          id: 'update-card',
          name: 'Update Card',
          description: 'Update a card',
          parameters: [
            { name: 'card_id', type: 'string', label: 'Card ID', required: true },
            { name: 'name', type: 'string', label: 'Card Name' },
            { name: 'description', type: 'textarea', label: 'Description' },
            { name: 'list_id', type: 'string', label: 'Move to List ID' },
          ],
        },
      },
    },
    asana: {
      id: 'asana',
      name: 'Asana',
      icon: 'CheckSquare',
      color: '#f06a6a',
      description: 'Asana projects and tasks',
      actions: {
        'create-task': {
          id: 'create-task',
          name: 'Create Task',
          description: 'Create a new task',
          parameters: [
            { name: 'project_id', type: 'string', label: 'Project ID', required: true },
            { name: 'name', type: 'string', label: 'Task Name', required: true },
            { name: 'notes', type: 'textarea', label: 'Notes' },
            { name: 'due_on', type: 'string', label: 'Due Date', placeholder: 'YYYY-MM-DD' },
          ],
        },
        'get-tasks': {
          id: 'get-tasks',
          name: 'Get Tasks',
          description: 'Retrieve tasks from a project',
          parameters: [
            { name: 'project_id', type: 'string', label: 'Project ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'update-task': {
          id: 'update-task',
          name: 'Update Task',
          description: 'Update a task',
          parameters: [
            { name: 'task_id', type: 'string', label: 'Task ID', required: true },
            { name: 'name', type: 'string', label: 'Task Name' },
            { name: 'completed', type: 'boolean', label: 'Completed' },
          ],
        },
      },
    },
    monday: {
      id: 'monday',
      name: 'Monday.com',
      icon: 'LayoutDashboard',
      color: '#6161ff',
      description: 'Monday.com boards and items',
      actions: {
        'create-item': {
          id: 'create-item',
          name: 'Create Item',
          description: 'Create a new item',
          parameters: [
            { name: 'board_id', type: 'string', label: 'Board ID', required: true },
            { name: 'item_name', type: 'string', label: 'Item Name', required: true },
            { name: 'column_values', type: 'textarea', label: 'Column Values (JSON)', placeholder: '{"status": "Working on it"}' },
          ],
        },
        'get-items': {
          id: 'get-items',
          name: 'Get Items',
          description: 'Retrieve items from a board',
          parameters: [
            { name: 'board_id', type: 'string', label: 'Board ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'update-item': {
          id: 'update-item',
          name: 'Update Item',
          description: 'Update an item',
          parameters: [
            { name: 'item_id', type: 'string', label: 'Item ID', required: true },
            { name: 'column_values', type: 'textarea', label: 'Column Values (JSON)', required: true },
          ],
        },
      },
    },
    clickup: {
      id: 'clickup',
      name: 'ClickUp',
      icon: 'MousePointerClick',
      color: '#7b68ee',
      description: 'ClickUp tasks and spaces',
      actions: {
        'create-task': {
          id: 'create-task',
          name: 'Create Task',
          description: 'Create a new task',
          parameters: [
            { name: 'list_id', type: 'string', label: 'List ID', required: true },
            { name: 'name', type: 'string', label: 'Task Name', required: true },
            { name: 'description', type: 'textarea', label: 'Description' },
            { name: 'due_date', type: 'string', label: 'Due Date', placeholder: 'Unix timestamp' },
          ],
        },
        'get-tasks': {
          id: 'get-tasks',
          name: 'Get Tasks',
          description: 'Retrieve tasks from a list',
          parameters: [
            { name: 'list_id', type: 'string', label: 'List ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'update-task': {
          id: 'update-task',
          name: 'Update Task',
          description: 'Update a task',
          parameters: [
            { name: 'task_id', type: 'string', label: 'Task ID', required: true },
            { name: 'name', type: 'string', label: 'Task Name' },
            { name: 'status', type: 'string', label: 'Status' },
          ],
        },
      },
    },
    todoist: {
      id: 'todoist',
      name: 'Todoist',
      icon: 'ListTodo',
      color: '#e44332',
      description: 'Todoist tasks and projects',
      actions: {
        'create-task': {
          id: 'create-task',
          name: 'Create Task',
          description: 'Create a new task',
          parameters: [
            { name: 'content', type: 'string', label: 'Task Content', required: true },
            { name: 'project_id', type: 'string', label: 'Project ID' },
            { name: 'due_date', type: 'string', label: 'Due Date', placeholder: 'YYYY-MM-DD' },
            { name: 'priority', type: 'select', label: 'Priority', options: ['1', '2', '3', '4'], default: '1' },
          ],
        },
        'get-tasks': {
          id: 'get-tasks',
          name: 'Get Tasks',
          description: 'Retrieve tasks',
          parameters: [
            { name: 'project_id', type: 'string', label: 'Project ID' },
            { name: 'filter', type: 'string', label: 'Filter', placeholder: 'today, overdue, etc.' },
          ],
        },
        'complete-task': {
          id: 'complete-task',
          name: 'Complete Task',
          description: 'Mark a task as complete',
          parameters: [
            { name: 'task_id', type: 'string', label: 'Task ID', required: true },
          ],
        },
      },
    },
  },
};

// Development Integration
export const DEVELOPMENT_INTEGRATIONS: IntegrationCategory = {
  id: 'development',
  name: 'Development Integration',
  description: 'Development and version control tools',
  icon: 'Code',
  color: '#181717',
  providers: {
    github: {
      id: 'github',
      name: 'GitHub',
      icon: 'Github',
      color: '#181717',
      description: 'GitHub repositories and issues',
      actions: {
        'create-issue': {
          id: 'create-issue',
          name: 'Create Issue',
          description: 'Create a new issue',
          parameters: [
            { name: 'repo', type: 'string', label: 'Repository', required: true, placeholder: 'owner/repo' },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'body', type: 'textarea', label: 'Body' },
            { name: 'labels', type: 'string', label: 'Labels (comma-separated)', placeholder: 'bug, enhancement' },
          ],
        },
        'get-issue': {
          id: 'get-issue',
          name: 'Get Issue',
          description: 'Retrieve an issue',
          parameters: [
            { name: 'repo', type: 'string', label: 'Repository', required: true },
            { name: 'issue_number', type: 'number', label: 'Issue Number', required: true },
          ],
        },
        'create-pull-request': {
          id: 'create-pull-request',
          name: 'Create Pull Request',
          description: 'Create a pull request',
          parameters: [
            { name: 'repo', type: 'string', label: 'Repository', required: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'head', type: 'string', label: 'Head Branch', required: true },
            { name: 'base', type: 'string', label: 'Base Branch', required: true, default: 'main' },
            { name: 'body', type: 'textarea', label: 'Body' },
          ],
        },
        'list-issues': {
          id: 'list-issues',
          name: 'List Issues',
          description: 'List issues from a repository',
          parameters: [
            { name: 'repo', type: 'string', label: 'Repository', required: true },
            { name: 'state', type: 'select', label: 'State', options: ['open', 'closed', 'all'], default: 'open' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
    gitlab: {
      id: 'gitlab',
      name: 'GitLab',
      icon: 'GitBranch',
      color: '#fc6d26',
      description: 'GitLab projects and issues',
      actions: {
        'create-issue': {
          id: 'create-issue',
          name: 'Create Issue',
          description: 'Create a new issue',
          parameters: [
            { name: 'project_id', type: 'string', label: 'Project ID', required: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'description', type: 'textarea', label: 'Description' },
            { name: 'labels', type: 'string', label: 'Labels (comma-separated)' },
          ],
        },
        'get-issue': {
          id: 'get-issue',
          name: 'Get Issue',
          description: 'Retrieve an issue',
          parameters: [
            { name: 'project_id', type: 'string', label: 'Project ID', required: true },
            { name: 'issue_iid', type: 'number', label: 'Issue IID', required: true },
          ],
        },
        'create-merge-request': {
          id: 'create-merge-request',
          name: 'Create Merge Request',
          description: 'Create a merge request',
          parameters: [
            { name: 'project_id', type: 'string', label: 'Project ID', required: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'source_branch', type: 'string', label: 'Source Branch', required: true },
            { name: 'target_branch', type: 'string', label: 'Target Branch', required: true, default: 'main' },
            { name: 'description', type: 'textarea', label: 'Description' },
          ],
        },
        'list-issues': {
          id: 'list-issues',
          name: 'List Issues',
          description: 'List issues from a project',
          parameters: [
            { name: 'project_id', type: 'string', label: 'Project ID', required: true },
            { name: 'state', type: 'select', label: 'State', options: ['opened', 'closed', 'all'], default: 'opened' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
    jira: {
      id: 'jira',
      name: 'Jira',
      icon: 'Bug',
      color: '#0052cc',
      description: 'Jira issues and projects',
      actions: {
        'create-issue': {
          id: 'create-issue',
          name: 'Create Issue',
          description: 'Create a new issue',
          parameters: [
            { name: 'project_key', type: 'string', label: 'Project Key', required: true },
            { name: 'summary', type: 'string', label: 'Summary', required: true },
            { name: 'issue_type', type: 'select', label: 'Issue Type', options: ['Bug', 'Task', 'Story', 'Epic'], default: 'Task' },
            { name: 'description', type: 'textarea', label: 'Description' },
          ],
        },
        'get-issue': {
          id: 'get-issue',
          name: 'Get Issue',
          description: 'Retrieve an issue',
          parameters: [
            { name: 'issue_key', type: 'string', label: 'Issue Key', required: true, placeholder: 'PROJ-123' },
          ],
        },
        'update-issue': {
          id: 'update-issue',
          name: 'Update Issue',
          description: 'Update an issue',
          parameters: [
            { name: 'issue_key', type: 'string', label: 'Issue Key', required: true },
            { name: 'summary', type: 'string', label: 'Summary' },
            { name: 'description', type: 'textarea', label: 'Description' },
            { name: 'status', type: 'string', label: 'Status' },
          ],
        },
        'search-issues': {
          id: 'search-issues',
          name: 'Search Issues',
          description: 'Search for issues using JQL',
          parameters: [
            { name: 'jql', type: 'textarea', label: 'JQL Query', required: true, placeholder: 'project = PROJ AND status = Open' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
    linear: {
      id: 'linear',
      name: 'Linear',
      icon: 'Layers',
      color: '#5e6ad2',
      description: 'Linear issues and projects',
      actions: {
        'create-issue': {
          id: 'create-issue',
          name: 'Create Issue',
          description: 'Create a new issue',
          parameters: [
            { name: 'team_id', type: 'string', label: 'Team ID', required: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'description', type: 'textarea', label: 'Description' },
            { name: 'priority', type: 'select', label: 'Priority', options: ['0', '1', '2', '3', '4'], default: '2' },
          ],
        },
        'get-issue': {
          id: 'get-issue',
          name: 'Get Issue',
          description: 'Retrieve an issue',
          parameters: [
            { name: 'issue_id', type: 'string', label: 'Issue ID', required: true },
          ],
        },
        'update-issue': {
          id: 'update-issue',
          name: 'Update Issue',
          description: 'Update an issue',
          parameters: [
            { name: 'issue_id', type: 'string', label: 'Issue ID', required: true },
            { name: 'title', type: 'string', label: 'Title' },
            { name: 'description', type: 'textarea', label: 'Description' },
            { name: 'state_id', type: 'string', label: 'State ID' },
          ],
        },
        'list-issues': {
          id: 'list-issues',
          name: 'List Issues',
          description: 'List issues from a team',
          parameters: [
            { name: 'team_id', type: 'string', label: 'Team ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
    bitbucket: {
      id: 'bitbucket',
      name: 'Bitbucket',
      icon: 'GitBranch',
      color: '#0052cc',
      description: 'Bitbucket repositories and pull requests',
      actions: {
        'create-pull-request': {
          id: 'create-pull-request',
          name: 'Create Pull Request',
          description: 'Create a pull request',
          parameters: [
            { name: 'workspace', type: 'string', label: 'Workspace', required: true },
            { name: 'repo_slug', type: 'string', label: 'Repository Slug', required: true },
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'source_branch', type: 'string', label: 'Source Branch', required: true },
            { name: 'destination_branch', type: 'string', label: 'Destination Branch', required: true, default: 'main' },
            { name: 'description', type: 'textarea', label: 'Description' },
          ],
        },
        'get-pull-request': {
          id: 'get-pull-request',
          name: 'Get Pull Request',
          description: 'Retrieve a pull request',
          parameters: [
            { name: 'workspace', type: 'string', label: 'Workspace', required: true },
            { name: 'repo_slug', type: 'string', label: 'Repository Slug', required: true },
            { name: 'pull_request_id', type: 'number', label: 'Pull Request ID', required: true },
          ],
        },
        'list-pull-requests': {
          id: 'list-pull-requests',
          name: 'List Pull Requests',
          description: 'List pull requests',
          parameters: [
            { name: 'workspace', type: 'string', label: 'Workspace', required: true },
            { name: 'repo_slug', type: 'string', label: 'Repository Slug', required: true },
            { name: 'state', type: 'select', label: 'State', options: ['OPEN', 'MERGED', 'DECLINED'], default: 'OPEN' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
    sentry: {
      id: 'sentry',
      name: 'Sentry',
      icon: 'AlertTriangle',
      color: '#362d59',
      description: 'Sentry error tracking',
      actions: {
        'get-issue': {
          id: 'get-issue',
          name: 'Get Issue',
          description: 'Retrieve an error issue',
          parameters: [
            { name: 'organization_slug', type: 'string', label: 'Organization Slug', required: true },
            { name: 'project_slug', type: 'string', label: 'Project Slug', required: true },
            { name: 'issue_id', type: 'string', label: 'Issue ID', required: true },
          ],
        },
        'list-issues': {
          id: 'list-issues',
          name: 'List Issues',
          description: 'List error issues',
          parameters: [
            { name: 'organization_slug', type: 'string', label: 'Organization Slug', required: true },
            { name: 'project_slug', type: 'string', label: 'Project Slug', required: true },
            { name: 'status', type: 'select', label: 'Status', options: ['unresolved', 'resolved', 'ignored'], default: 'unresolved' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'resolve-issue': {
          id: 'resolve-issue',
          name: 'Resolve Issue',
          description: 'Resolve an error issue',
          parameters: [
            { name: 'organization_slug', type: 'string', label: 'Organization Slug', required: true },
            { name: 'project_slug', type: 'string', label: 'Project Slug', required: true },
            { name: 'issue_id', type: 'string', label: 'Issue ID', required: true },
          ],
        },
        'create-release': {
          id: 'create-release',
          name: 'Create Release',
          description: 'Create a new release',
          parameters: [
            { name: 'organization_slug', type: 'string', label: 'Organization Slug', required: true },
            { name: 'project_slug', type: 'string', label: 'Project Slug', required: true },
            { name: 'version', type: 'string', label: 'Version', required: true },
          ],
        },
      },
    },
  },
};

// Marketing Integration
export const MARKETING_INTEGRATIONS: IntegrationCategory = {
  id: 'marketing',
  name: 'Marketing Integration',
  description: 'Email marketing and advertising platforms',
  icon: 'Megaphone',
  color: '#ffe01b',
  providers: {
    mailchimp: {
      id: 'mailchimp',
      name: 'Mailchimp',
      icon: 'Mail',
      color: '#ffe01b',
      description: 'Mailchimp email marketing',
      actions: {
        'send-campaign': {
          id: 'send-campaign',
          name: 'Send Campaign',
          description: 'Send an email campaign',
          parameters: [
            { name: 'campaign_id', type: 'string', label: 'Campaign ID', required: true },
          ],
        },
        'add-subscriber': {
          id: 'add-subscriber',
          name: 'Add Subscriber',
          description: 'Add a subscriber to a list',
          parameters: [
            { name: 'list_id', type: 'string', label: 'List ID', required: true },
            { name: 'email', type: 'string', label: 'Email', required: true },
            { name: 'first_name', type: 'string', label: 'First Name' },
            { name: 'last_name', type: 'string', label: 'Last Name' },
            { name: 'status', type: 'select', label: 'Status', options: ['subscribed', 'unsubscribed', 'cleaned', 'pending'], default: 'subscribed' },
          ],
        },
        'get-subscribers': {
          id: 'get-subscribers',
          name: 'Get Subscribers',
          description: 'Get subscribers from a list',
          parameters: [
            { name: 'list_id', type: 'string', label: 'List ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'update-subscriber': {
          id: 'update-subscriber',
          name: 'Update Subscriber',
          description: 'Update subscriber information',
          parameters: [
            { name: 'list_id', type: 'string', label: 'List ID', required: true },
            { name: 'subscriber_hash', type: 'string', label: 'Subscriber Hash', required: true },
            { name: 'email', type: 'string', label: 'Email' },
            { name: 'first_name', type: 'string', label: 'First Name' },
            { name: 'last_name', type: 'string', label: 'Last Name' },
          ],
        },
      },
    },
    sendgrid: {
      id: 'sendgrid',
      name: 'SendGrid',
      icon: 'Send',
      color: '#1a82e2',
      description: 'SendGrid transactional email',
      actions: {
        'send-email': {
          id: 'send-email',
          name: 'Send Email',
          description: 'Send a transactional email',
          parameters: [
            { name: 'to', type: 'string', label: 'To', required: true, placeholder: 'recipient@example.com' },
            { name: 'from', type: 'string', label: 'From', required: true, placeholder: 'sender@example.com' },
            { name: 'subject', type: 'string', label: 'Subject', required: true },
            { name: 'content', type: 'textarea', label: 'Content (HTML or plain text)', required: true },
          ],
        },
        'add-contact': {
          id: 'add-contact',
          name: 'Add Contact',
          description: 'Add a contact to SendGrid',
          parameters: [
            { name: 'email', type: 'string', label: 'Email', required: true },
            { name: 'first_name', type: 'string', label: 'First Name' },
            { name: 'last_name', type: 'string', label: 'Last Name' },
            { name: 'list_ids', type: 'string', label: 'List IDs (comma-separated)' },
          ],
        },
        'get-contacts': {
          id: 'get-contacts',
          name: 'Get Contacts',
          description: 'Get contacts from SendGrid',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
    mailerlite: {
      id: 'mailerlite',
      name: 'MailerLite',
      icon: 'Mail',
      color: '#09c269',
      description: 'MailerLite email marketing',
      actions: {
        'add-subscriber': {
          id: 'add-subscriber',
          name: 'Add Subscriber',
          description: 'Add a subscriber',
          parameters: [
            { name: 'email', type: 'string', label: 'Email', required: true },
            { name: 'name', type: 'string', label: 'Name' },
            { name: 'groups', type: 'string', label: 'Group IDs (comma-separated)' },
            { name: 'status', type: 'select', label: 'Status', options: ['active', 'unsubscribed', 'bounced', 'junk'], default: 'active' },
          ],
        },
        'get-subscribers': {
          id: 'get-subscribers',
          name: 'Get Subscribers',
          description: 'Get subscribers from a group',
          parameters: [
            { name: 'group_id', type: 'string', label: 'Group ID' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'send-campaign': {
          id: 'send-campaign',
          name: 'Send Campaign',
          description: 'Send a campaign',
          parameters: [
            { name: 'campaign_id', type: 'string', label: 'Campaign ID', required: true },
          ],
        },
      },
    },
    convertkit: {
      id: 'convertkit',
      name: 'ConvertKit',
      icon: 'Sparkles',
      color: '#fb6970',
      description: 'ConvertKit email for creators',
      actions: {
        'add-subscriber': {
          id: 'add-subscriber',
          name: 'Add Subscriber',
          description: 'Add a subscriber',
          parameters: [
            { name: 'email', type: 'string', label: 'Email', required: true },
            { name: 'first_name', type: 'string', label: 'First Name' },
            { name: 'tags', type: 'string', label: 'Tags (comma-separated)' },
          ],
        },
        'get-subscribers': {
          id: 'get-subscribers',
          name: 'Get Subscribers',
          description: 'Get subscribers',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'send-broadcast': {
          id: 'send-broadcast',
          name: 'Send Broadcast',
          description: 'Send a broadcast email',
          parameters: [
            { name: 'subject', type: 'string', label: 'Subject', required: true },
            { name: 'content', type: 'textarea', label: 'Content (HTML)', required: true },
          ],
        },
      },
    },
    'google-ads': {
      id: 'google-ads',
      name: 'Google Ads',
      icon: 'Megaphone',
      color: '#4285f4',
      description: 'Google Ads campaigns',
      actions: {
        'create-campaign': {
          id: 'create-campaign',
          name: 'Create Campaign',
          description: 'Create a new campaign',
          parameters: [
            { name: 'name', type: 'string', label: 'Campaign Name', required: true },
            { name: 'budget', type: 'number', label: 'Daily Budget', required: true },
            { name: 'campaign_type', type: 'select', label: 'Campaign Type', options: ['SEARCH', 'DISPLAY', 'VIDEO', 'SHOPPING'], default: 'SEARCH' },
          ],
        },
        'get-campaigns': {
          id: 'get-campaigns',
          name: 'Get Campaigns',
          description: 'Get campaigns',
          parameters: [
            { name: 'customer_id', type: 'string', label: 'Customer ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-metrics': {
          id: 'get-metrics',
          name: 'Get Campaign Metrics',
          description: 'Get campaign performance metrics',
          parameters: [
            { name: 'customer_id', type: 'string', label: 'Customer ID', required: true },
            { name: 'campaign_id', type: 'string', label: 'Campaign ID' },
            { name: 'date_from', type: 'string', label: 'Date From', placeholder: 'YYYY-MM-DD' },
            { name: 'date_to', type: 'string', label: 'Date To', placeholder: 'YYYY-MM-DD' },
          ],
        },
      },
    },
    'facebook-ads': {
      id: 'facebook-ads',
      name: 'Facebook Ads',
      icon: 'Megaphone',
      color: '#1877f2',
      description: 'Facebook Ads campaigns',
      actions: {
        'create-campaign': {
          id: 'create-campaign',
          name: 'Create Campaign',
          description: 'Create a new campaign',
          parameters: [
            { name: 'account_id', type: 'string', label: 'Ad Account ID', required: true },
            { name: 'name', type: 'string', label: 'Campaign Name', required: true },
            { name: 'objective', type: 'select', label: 'Objective', options: ['OUTCOME_TRAFFIC', 'OUTCOME_ENGAGEMENT', 'OUTCOME_LEADS', 'OUTCOME_APP_PROMOTION', 'OUTCOME_SALES'], default: 'OUTCOME_TRAFFIC' },
            { name: 'daily_budget', type: 'number', label: 'Daily Budget' },
          ],
        },
        'get-campaigns': {
          id: 'get-campaigns',
          name: 'Get Campaigns',
          description: 'Get campaigns',
          parameters: [
            { name: 'account_id', type: 'string', label: 'Ad Account ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-insights': {
          id: 'get-insights',
          name: 'Get Campaign Insights',
          description: 'Get campaign performance insights',
          parameters: [
            { name: 'account_id', type: 'string', label: 'Ad Account ID', required: true },
            { name: 'campaign_id', type: 'string', label: 'Campaign ID' },
            { name: 'date_preset', type: 'select', label: 'Date Preset', options: ['today', 'yesterday', 'last_7d', 'last_30d', 'this_month', 'last_month'], default: 'last_7d' },
          ],
        },
      },
    },
  },
};

// Analytics Integration
export const ANALYTICS_INTEGRATIONS: IntegrationCategory = {
  id: 'analytics',
  name: 'Analytics Integration',
  description: 'Analytics and data tracking platforms',
  icon: 'BarChart3',
  color: '#f9ab00',
  providers: {
    'google-analytics': {
      id: 'google-analytics',
      name: 'Google Analytics',
      icon: 'BarChart3',
      color: '#f9ab00',
      description: 'Google Analytics web analytics',
      actions: {
        'get-report': {
          id: 'get-report',
          name: 'Get Report',
          description: 'Get analytics report',
          parameters: [
            { name: 'property_id', type: 'string', label: 'Property ID', required: true },
            { name: 'start_date', type: 'string', label: 'Start Date', required: true, placeholder: 'YYYY-MM-DD' },
            { name: 'end_date', type: 'string', label: 'End Date', required: true, placeholder: 'YYYY-MM-DD' },
            { name: 'metrics', type: 'string', label: 'Metrics (comma-separated)', placeholder: 'sessions, users, pageviews' },
          ],
        },
        'track-event': {
          id: 'track-event',
          name: 'Track Event',
          description: 'Track a custom event',
          parameters: [
            { name: 'property_id', type: 'string', label: 'Property ID', required: true },
            { name: 'event_name', type: 'string', label: 'Event Name', required: true },
            { name: 'event_params', type: 'textarea', label: 'Event Parameters (JSON)', placeholder: '{"value": 100, "currency": "USD"}' },
          ],
        },
        'get-realtime-data': {
          id: 'get-realtime-data',
          name: 'Get Realtime Data',
          description: 'Get realtime analytics data',
          parameters: [
            { name: 'property_id', type: 'string', label: 'Property ID', required: true },
            { name: 'metrics', type: 'string', label: 'Metrics (comma-separated)', default: 'activeUsers' },
          ],
        },
      },
    },
    mixpanel: {
      id: 'mixpanel',
      name: 'Mixpanel',
      icon: 'PieChart',
      color: '#7856ff',
      description: 'Mixpanel product analytics',
      actions: {
        'track-event': {
          id: 'track-event',
          name: 'Track Event',
          description: 'Track an event',
          parameters: [
            { name: 'event_name', type: 'string', label: 'Event Name', required: true },
            { name: 'distinct_id', type: 'string', label: 'Distinct ID', required: true },
            { name: 'properties', type: 'textarea', label: 'Properties (JSON)', placeholder: '{"amount": 100, "product": "Widget"}' },
          ],
        },
        'get-events': {
          id: 'get-events',
          name: 'Get Events',
          description: 'Get events data',
          parameters: [
            { name: 'event', type: 'string', label: 'Event Name' },
            { name: 'from_date', type: 'string', label: 'From Date', placeholder: 'YYYY-MM-DD' },
            { name: 'to_date', type: 'string', label: 'To Date', placeholder: 'YYYY-MM-DD' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-insights': {
          id: 'get-insights',
          name: 'Get Insights',
          description: 'Get insights and funnels',
          parameters: [
            { name: 'insight_type', type: 'select', label: 'Insight Type', options: ['funnel', 'retention', 'cohort'], default: 'funnel' },
            { name: 'from_date', type: 'string', label: 'From Date', required: true, placeholder: 'YYYY-MM-DD' },
            { name: 'to_date', type: 'string', label: 'To Date', required: true, placeholder: 'YYYY-MM-DD' },
          ],
        },
      },
    },
    segment: {
      id: 'segment',
      name: 'Segment',
      icon: 'Activity',
      color: '#52bd95',
      description: 'Segment customer data platform',
      actions: {
        'track-event': {
          id: 'track-event',
          name: 'Track Event',
          description: 'Track an event',
          parameters: [
            { name: 'user_id', type: 'string', label: 'User ID', required: true },
            { name: 'event_name', type: 'string', label: 'Event Name', required: true },
            { name: 'properties', type: 'textarea', label: 'Properties (JSON)', placeholder: '{"revenue": 100, "product": "Widget"}' },
          ],
        },
        'identify-user': {
          id: 'identify-user',
          name: 'Identify User',
          description: 'Identify a user',
          parameters: [
            { name: 'user_id', type: 'string', label: 'User ID', required: true },
            { name: 'traits', type: 'textarea', label: 'Traits (JSON)', placeholder: '{"email": "user@example.com", "name": "John"}' },
          ],
        },
        'get-user': {
          id: 'get-user',
          name: 'Get User',
          description: 'Get user data',
          parameters: [
            { name: 'user_id', type: 'string', label: 'User ID', required: true },
          ],
        },
        'export-data': {
          id: 'export-data',
          name: 'Export Data',
          description: 'Export data to destination',
          parameters: [
            { name: 'destination_id', type: 'string', label: 'Destination ID', required: true },
            { name: 'from_date', type: 'string', label: 'From Date', placeholder: 'YYYY-MM-DD' },
            { name: 'to_date', type: 'string', label: 'To Date', placeholder: 'YYYY-MM-DD' },
          ],
        },
      },
    },
  },
};

// Forms Integration
export const FORMS_INTEGRATIONS: IntegrationCategory = {
  id: 'forms',
  name: 'Forms Integration',
  description: 'Form and survey platforms',
  icon: 'FileQuestion',
  color: '#262627',
  providers: {
    typeform: {
      id: 'typeform',
      name: 'Typeform',
      icon: 'FileQuestion',
      color: '#262627',
      description: 'Typeform forms and surveys',
      actions: {
        'get-responses': {
          id: 'get-responses',
          name: 'Get Responses',
          description: 'Get form responses',
          parameters: [
            { name: 'form_id', type: 'string', label: 'Form ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-response': {
          id: 'get-response',
          name: 'Get Response',
          description: 'Get a specific response',
          parameters: [
            { name: 'form_id', type: 'string', label: 'Form ID', required: true },
            { name: 'response_id', type: 'string', label: 'Response ID', required: true },
          ],
        },
        'create-form': {
          id: 'create-form',
          name: 'Create Form',
          description: 'Create a new form',
          parameters: [
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'description', type: 'textarea', label: 'Description' },
          ],
        },
      },
    },
    'google-forms': {
      id: 'google-forms',
      name: 'Google Forms',
      icon: 'ClipboardList',
      color: '#673ab7',
      description: 'Google Forms responses',
      actions: {
        'get-responses': {
          id: 'get-responses',
          name: 'Get Responses',
          description: 'Get form responses',
          parameters: [
            { name: 'form_id', type: 'string', label: 'Form ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-response': {
          id: 'get-response',
          name: 'Get Response',
          description: 'Get a specific response',
          parameters: [
            { name: 'form_id', type: 'string', label: 'Form ID', required: true },
            { name: 'response_id', type: 'string', label: 'Response ID', required: true },
          ],
        },
        'create-form': {
          id: 'create-form',
          name: 'Create Form',
          description: 'Create a new form',
          parameters: [
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'description', type: 'textarea', label: 'Description' },
          ],
        },
      },
    },
    jotform: {
      id: 'jotform',
      name: 'JotForm',
      icon: 'FormInput',
      color: '#0099ff',
      description: 'JotForm online forms',
      actions: {
        'get-submissions': {
          id: 'get-submissions',
          name: 'Get Submissions',
          description: 'Get form submissions',
          parameters: [
            { name: 'form_id', type: 'string', label: 'Form ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-submission': {
          id: 'get-submission',
          name: 'Get Submission',
          description: 'Get a specific submission',
          parameters: [
            { name: 'form_id', type: 'string', label: 'Form ID', required: true },
            { name: 'submission_id', type: 'string', label: 'Submission ID', required: true },
          ],
        },
        'create-form': {
          id: 'create-form',
          name: 'Create Form',
          description: 'Create a new form',
          parameters: [
            { name: 'title', type: 'string', label: 'Title', required: true },
            { name: 'description', type: 'textarea', label: 'Description' },
          ],
        },
      },
    },
  },
};

// Customer Support Integration
export const SUPPORT_INTEGRATIONS: IntegrationCategory = {
  id: 'support',
  name: 'Support Integration',
  description: 'Customer support and helpdesk platforms',
  icon: 'Headphones',
  color: '#03363d',
  providers: {
    zendesk: {
      id: 'zendesk',
      name: 'Zendesk',
      icon: 'Headphones',
      color: '#03363d',
      description: 'Zendesk support tickets',
      actions: {
        'create-ticket': {
          id: 'create-ticket',
          name: 'Create Ticket',
          description: 'Create a support ticket',
          parameters: [
            { name: 'subject', type: 'string', label: 'Subject', required: true },
            { name: 'description', type: 'textarea', label: 'Description', required: true },
            { name: 'requester_email', type: 'string', label: 'Requester Email', required: true },
            { name: 'priority', type: 'select', label: 'Priority', options: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
          ],
        },
        'get-tickets': {
          id: 'get-tickets',
          name: 'Get Tickets',
          description: 'Get support tickets',
          parameters: [
            { name: 'status', type: 'select', label: 'Status', options: ['new', 'open', 'pending', 'hold', 'solved', 'closed'], default: 'open' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'update-ticket': {
          id: 'update-ticket',
          name: 'Update Ticket',
          description: 'Update a ticket',
          parameters: [
            { name: 'ticket_id', type: 'string', label: 'Ticket ID', required: true },
            { name: 'status', type: 'select', label: 'Status', options: ['new', 'open', 'pending', 'hold', 'solved', 'closed'] },
            { name: 'comment', type: 'textarea', label: 'Comment' },
          ],
        },
        'get-ticket': {
          id: 'get-ticket',
          name: 'Get Ticket',
          description: 'Get a specific ticket',
          parameters: [
            { name: 'ticket_id', type: 'string', label: 'Ticket ID', required: true },
          ],
        },
      },
    },
    intercom: {
      id: 'intercom',
      name: 'Intercom',
      icon: 'MessageSquare',
      color: '#1f8ded',
      description: 'Intercom messaging and support',
      actions: {
        'create-conversation': {
          id: 'create-conversation',
          name: 'Create Conversation',
          description: 'Create a new conversation',
          parameters: [
            { name: 'user_id', type: 'string', label: 'User ID', required: true },
            { name: 'message', type: 'textarea', label: 'Message', required: true },
          ],
        },
        'get-conversations': {
          id: 'get-conversations',
          name: 'Get Conversations',
          description: 'Get conversations',
          parameters: [
            { name: 'user_id', type: 'string', label: 'User ID' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'send-message': {
          id: 'send-message',
          name: 'Send Message',
          description: 'Send a message in a conversation',
          parameters: [
            { name: 'conversation_id', type: 'string', label: 'Conversation ID', required: true },
            { name: 'message', type: 'textarea', label: 'Message', required: true },
          ],
        },
        'get-users': {
          id: 'get-users',
          name: 'Get Users',
          description: 'Get users',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
      },
    },
    freshdesk: {
      id: 'freshdesk',
      name: 'Freshdesk',
      icon: 'HelpCircle',
      color: '#25c16f',
      description: 'Freshdesk support tickets',
      actions: {
        'create-ticket': {
          id: 'create-ticket',
          name: 'Create Ticket',
          description: 'Create a support ticket',
          parameters: [
            { name: 'subject', type: 'string', label: 'Subject', required: true },
            { name: 'description', type: 'textarea', label: 'Description', required: true },
            { name: 'email', type: 'string', label: 'Email', required: true },
            { name: 'priority', type: 'select', label: 'Priority', options: ['1', '2', '3', '4'], default: '2' },
            { name: 'status', type: 'select', label: 'Status', options: ['2', '3', '4', '5', '6'], default: '2' },
          ],
        },
        'get-tickets': {
          id: 'get-tickets',
          name: 'Get Tickets',
          description: 'Get support tickets',
          parameters: [
            { name: 'status', type: 'select', label: 'Status', options: ['2', '3', '4', '5', '6'], default: '2' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'update-ticket': {
          id: 'update-ticket',
          name: 'Update Ticket',
          description: 'Update a ticket',
          parameters: [
            { name: 'ticket_id', type: 'string', label: 'Ticket ID', required: true },
            { name: 'status', type: 'select', label: 'Status', options: ['2', '3', '4', '5', '6'] },
            { name: 'note', type: 'textarea', label: 'Note' },
          ],
        },
      },
    },
    crisp: {
      id: 'crisp',
      name: 'Crisp',
      icon: 'MessagesSquare',
      color: '#4b5cff',
      description: 'Crisp live chat',
      actions: {
        'send-message': {
          id: 'send-message',
          name: 'Send Message',
          description: 'Send a message to a conversation',
          parameters: [
            { name: 'website_id', type: 'string', label: 'Website ID', required: true },
            { name: 'session_id', type: 'string', label: 'Session ID', required: true },
            { name: 'content', type: 'textarea', label: 'Message', required: true },
            { name: 'type', type: 'select', label: 'Type', options: ['text', 'file', 'picker'], default: 'text' },
          ],
        },
        'get-conversations': {
          id: 'get-conversations',
          name: 'Get Conversations',
          description: 'Get conversations',
          parameters: [
            { name: 'website_id', type: 'string', label: 'Website ID', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-conversation': {
          id: 'get-conversation',
          name: 'Get Conversation',
          description: 'Get a specific conversation',
          parameters: [
            { name: 'website_id', type: 'string', label: 'Website ID', required: true },
            { name: 'session_id', type: 'string', label: 'Session ID', required: true },
          ],
        },
      },
    },
  },
};

// Cloud Services Integration
export const CLOUD_INTEGRATIONS: IntegrationCategory = {
  id: 'cloud',
  name: 'Cloud Services Integration',
  description: 'Cloud computing and serverless platforms',
  icon: 'Cloud',
  color: '#ff9900',
  providers: {
    'aws-lambda': {
      id: 'aws-lambda',
      name: 'AWS Lambda',
      icon: 'Zap',
      color: '#ff9900',
      description: 'AWS Lambda serverless functions',
      actions: {
        'invoke-function': {
          id: 'invoke-function',
          name: 'Invoke Function',
          description: 'Invoke a Lambda function',
          parameters: [
            { name: 'function_name', type: 'string', label: 'Function Name', required: true },
            { name: 'payload', type: 'textarea', label: 'Payload (JSON)', required: true, placeholder: '{"key": "value"}' },
            { name: 'invocation_type', type: 'select', label: 'Invocation Type', options: ['RequestResponse', 'Event', 'DryRun'], default: 'RequestResponse' },
          ],
        },
        'list-functions': {
          id: 'list-functions',
          name: 'List Functions',
          description: 'List Lambda functions',
          parameters: [
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-function': {
          id: 'get-function',
          name: 'Get Function',
          description: 'Get function details',
          parameters: [
            { name: 'function_name', type: 'string', label: 'Function Name', required: true },
          ],
        },
      },
    },
    'google-cloud': {
      id: 'google-cloud',
      name: 'Google Cloud',
      icon: 'Cloud',
      color: '#4285f4',
      description: 'Google Cloud Platform services',
      actions: {
        'invoke-cloud-function': {
          id: 'invoke-cloud-function',
          name: 'Invoke Cloud Function',
          description: 'Invoke a Cloud Function',
          parameters: [
            { name: 'function_name', type: 'string', label: 'Function Name', required: true },
            { name: 'region', type: 'string', label: 'Region', required: true, placeholder: 'us-central1' },
            { name: 'data', type: 'textarea', label: 'Data (JSON)', required: true },
          ],
        },
        'list-functions': {
          id: 'list-functions',
          name: 'List Functions',
          description: 'List Cloud Functions',
          parameters: [
            { name: 'region', type: 'string', label: 'Region' },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-storage-object': {
          id: 'get-storage-object',
          name: 'Get Storage Object',
          description: 'Get object from Cloud Storage',
          parameters: [
            { name: 'bucket', type: 'string', label: 'Bucket Name', required: true },
            { name: 'object_name', type: 'string', label: 'Object Name', required: true },
          ],
        },
      },
    },
    azure: {
      id: 'azure',
      name: 'Azure',
      icon: 'Cloud',
      color: '#0078d4',
      description: 'Microsoft Azure services',
      actions: {
        'invoke-function': {
          id: 'invoke-function',
          name: 'Invoke Function',
          description: 'Invoke an Azure Function',
          parameters: [
            { name: 'function_app_name', type: 'string', label: 'Function App Name', required: true },
            { name: 'function_name', type: 'string', label: 'Function Name', required: true },
            { name: 'data', type: 'textarea', label: 'Data (JSON)', required: true },
          ],
        },
        'list-functions': {
          id: 'list-functions',
          name: 'List Functions',
          description: 'List Azure Functions',
          parameters: [
            { name: 'function_app_name', type: 'string', label: 'Function App Name', required: true },
            { name: 'limit', type: 'number', label: 'Limit', default: 10 },
          ],
        },
        'get-blob': {
          id: 'get-blob',
          name: 'Get Blob',
          description: 'Get blob from Azure Storage',
          parameters: [
            { name: 'container_name', type: 'string', label: 'Container Name', required: true },
            { name: 'blob_name', type: 'string', label: 'Blob Name', required: true },
          ],
        },
      },
    },
  },
};

// All integration categories
export const INTEGRATION_CATEGORIES: Record<string, IntegrationCategory> = {
  financial: FINANCIAL_INTEGRATIONS,
  ecommerce: ECOMMERCE_INTEGRATIONS,
  database: DATABASE_INTEGRATIONS,
  communication: COMMUNICATION_INTEGRATIONS,
  storage: STORAGE_INTEGRATIONS,
  'social-media': SOCIAL_MEDIA_INTEGRATIONS,
  crm: CRM_INTEGRATIONS,
  productivity: PRODUCTIVITY_INTEGRATIONS,
  development: DEVELOPMENT_INTEGRATIONS,
  marketing: MARKETING_INTEGRATIONS,
  analytics: ANALYTICS_INTEGRATIONS,
  forms: FORMS_INTEGRATIONS,
  support: SUPPORT_INTEGRATIONS,
  cloud: CLOUD_INTEGRATIONS,
};

// Helper to get all providers for a category
export function getProvidersForCategory(categoryId: string): IntegrationProvider[] {
  const category = INTEGRATION_CATEGORIES[categoryId];
  if (!category) return [];
  return Object.values(category.providers);
}

// Helper to get actions for a provider
export function getActionsForProvider(categoryId: string, providerId: string): IntegrationAction[] {
  const category = INTEGRATION_CATEGORIES[categoryId];
  if (!category) return [];
  const provider = category.providers[providerId];
  if (!provider) return [];
  return Object.values(provider.actions);
}

