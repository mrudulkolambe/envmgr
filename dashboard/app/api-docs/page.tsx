'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import './api-docs.css';

interface Endpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  auth?: string;
  body?: any;
  bodySchema?: { property: string; type: string; required: boolean; example?: any }[];
  params?: any[];
  responses: any;
}

const endpoints: { [key: string]: Endpoint[] } = {
  'Authentication': [
    {
      method: 'POST',
      path: '/api/auth/signup',
      summary: 'Sign Up',
      description: 'Create a new user account',
      bodySchema: [
        { property: 'name', type: 'string', required: true, example: 'John Doe' },
        { property: 'email', type: 'string', required: true, example: 'john@example.com' },
        { property: 'password', type: 'string', required: true, example: 'strongpassword' }
      ],
      body: { name: 'John Doe', email: 'john@example.com', password: 'strongpassword' },
      responses: { 201: 'User created', 400: 'Bad request', 409: 'Email exists' }
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      summary: 'Login',
      description: 'Authenticate user and create a session',
      bodySchema: [
        { property: 'email', type: 'string', required: true, example: 'john@example.com' },
        { property: 'password', type: 'string', required: true, example: 'strongpassword' }
      ],
      body: { email: 'john@example.com', password: 'strongpassword' },
      responses: { 200: 'Login successful', 401: 'Invalid credentials' }
    },
    {
      method: 'POST',
      path: '/api/auth/logout',
      summary: 'Logout',
      description: 'Invalidate the current session',
      auth: 'Session',
      responses: { 200: 'Logged out', 401: 'Unauthorized' }
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      summary: 'Get Current User',
      description: 'Returns the currently authenticated user',
      auth: 'Session',
      responses: { 200: 'User data', 401: 'Unauthorized' }
    }
  ],
  'Organizations': [
    {
      method: 'POST',
      path: '/api/orgs',
      summary: 'Create Organization',
      description: 'Create a new organization',
      auth: 'Session',
      bodySchema: [{ property: 'name', type: 'string', required: true, example: 'Acme Inc' }],
      body: { name: 'Acme Inc' },
      responses: { 201: 'Organization created', 400: 'Bad request' }
    },
    {
      method: 'GET',
      path: '/api/orgs',
      summary: 'List Organizations',
      description: 'List all organizations the user belongs to',
      auth: 'Session or CLI',
      responses: { 200: 'Organizations list', 401: 'Unauthorized' }
    },
    {
      method: 'GET',
      path: '/api/orgs/:orgId',
      summary: 'Get Org Details',
      description: 'Fetch organization info',
      auth: 'Member',
      params: [{ name: 'orgId', type: 'string', description: 'Org ID' }],
      responses: { 200: 'Org details', 404: 'Not found' }
    }
  ],
  'Projects': [
    {
      method: 'POST',
      path: '/api/orgs/:orgId/projects',
      summary: 'Create Project',
      description: 'Create a project under an organization',
      auth: 'Org Admin',
      params: [{ name: 'orgId', type: 'string', description: 'Org ID' }],
      bodySchema: [
        { property: 'name', type: 'string', required: true, example: 'backend-service' },
        { property: 'description', type: 'string', required: false, example: 'API Service' }
      ],
      body: { name: 'backend-service', description: 'API Service' },
      responses: { 201: 'Project created', 400: 'Bad request' }
    },
    {
      method: 'GET',
      path: '/api/orgs/:orgId/projects',
      summary: 'List Projects',
      description: 'List all projects in an organization',
      auth: 'Org Member',
      params: [{ name: 'orgId', type: 'string', description: 'Org ID' }],
      responses: { 200: 'Projects list', 401: 'Unauthorized' }
    }
  ],
  'Environments': [
    {
      method: 'POST',
      path: '/api/projects/:projectId/environments',
      summary: 'Create Environment',
      description: 'Create workspace (e.g., prod, staging)',
      auth: 'Project Member',
      params: [{ name: 'projectId', type: 'string', description: 'Project ID' }],
      bodySchema: [
        { property: 'name', type: 'string', required: true, example: 'production' },
        { property: 'slug', type: 'string', required: true, example: 'prod' }
      ],
      body: { name: 'production', slug: 'prod' },
      responses: { 201: 'Env created', 400: 'Bad request' }
    },
    {
      method: 'GET',
      path: '/api/projects/:projectId/environments',
      summary: 'List Environments',
      description: 'List all environments in a project',
      auth: 'Project Member',
      params: [{ name: 'projectId', type: 'string', description: 'Project ID' }],
      responses: { 200: 'Envs list', 404: 'Project not found' }
    }
  ],
  'Environment Variables': [
    {
      method: 'GET',
      path: '/api/environments/:envId/variables',
      summary: 'List Variables',
      description: 'Fetch masked variables for an environment',
      auth: 'Project Member',
      params: [{ name: 'envId', type: 'string', description: 'Env ID' }],
      responses: { 200: 'Variables list', 401: 'Unauthorized' }
    },
    {
      method: 'PUT',
      path: '/api/environments/:envId/variables',
      summary: 'Bulk Upsert',
      description: 'Create/Update multiple variables',
      auth: 'Project Member',
      params: [{ name: 'envId', type: 'string', description: 'Env ID' }],
      bodySchema: [{ property: 'variables', type: 'object', required: true, example: { KEY: 'VALUE' } }],
      body: { variables: { DATABASE_URL: 'postgres://...' } },
      responses: { 200: 'Updated successfully' }
    },
    {
      method: 'POST',
      path: '/api/environments/:envId/variables/replace',
      summary: 'Atomic Replace',
      description: 'Replace ALL variables (missing ones are deleted)',
      auth: 'Project Member',
      params: [{ name: 'envId', type: 'string', description: 'Env ID' }],
      bodySchema: [{ property: 'variables', type: 'object', required: true, example: { KEY: 'VALUE' } }],
      body: { variables: { APP_PORT: '3000' } },
      responses: { 200: 'Replaced successfully' }
    },
    {
      method: 'GET',
      path: '/api/environments/:envId/variables/export',
      summary: 'Export Dotenv',
      description: 'Export variables as raw text',
      auth: 'CLI Token',
      params: [{ name: 'envId', type: 'string', description: 'Env ID' }],
      responses: { 200: 'Raw string' }
    }
  ],
  'CLI Tokens': [
    {
      method: 'POST',
      path: '/api/auth/cli-tokens',
      summary: 'Create CLI Token',
      description: 'Generate a new CLI token',
      auth: 'Session',
      bodySchema: [{ property: 'name', type: 'string', required: true, example: 'MacBook Pro' }],
      body: { name: 'MacBook Pro' },
      responses: { 201: 'Token created', 401: 'Unauthorized' }
    },
    {
      method: 'GET',
      path: '/api/auth/cli-tokens',
      summary: 'List CLI Tokens',
      description: 'List all CLI tokens created by the user',
      auth: 'Session',
      responses: { 200: 'Tokens list', 401: 'Unauthorized' }
    }
  ]
};

function MethodBadge({ method }: { method: string }) {
  const className = `method-badge method-${method.toLowerCase()}`;
  return <Badge className={className}>{method}</Badge>;
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [requestBody, setRequestBody] = useState(
    endpoint.body ? JSON.stringify(endpoint.body, null, 2) : ''
  );
  const [pathParams, setPathParams] = useState<{ [key: string]: string }>({});
  const [bearerToken, setBearerToken] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);

    try {
      let url = endpoint.path;
      
      if (endpoint.params) {
        endpoint.params.forEach(param => {
          const value = pathParams[param.name] || '';
          url = url.replace(`:${param.name}`, value);
        });
      }

      const headers: any = { 'Content-Type': 'application/json' };

      if (endpoint.auth?.includes('Bearer') || endpoint.auth?.includes('CLI')) {
        if (bearerToken) {
          headers['Authorization'] = `Bearer ${bearerToken}`;
        }
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers,
        credentials: 'include',
      };

      if (endpoint.body && (endpoint.method === 'POST' || endpoint.method === 'PATCH' || endpoint.method === 'PUT')) {
        options.body = requestBody;
      }

      const startTime = performance.now();
      const res = await fetch(url, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        duration,
        data
      });
    } catch (error: any) {
      setResponse({
        status: 0,
        statusText: 'Error',
        duration: 0,
        data: { error: error.message }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="endpoint-card">
      <CardHeader 
        className="endpoint-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="endpoint-header-content">
          <div className="endpoint-left">
            <MethodBadge method={endpoint.method} />
            <code className="endpoint-path">{endpoint.path}</code>
            <span className="endpoint-summary">{endpoint.summary}</span>
          </div>
          {endpoint.auth && (
            <Badge variant="outline" className="auth-badge">
              🔒 {endpoint.auth}
            </Badge>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="endpoint-content">
          <p className="endpoint-description">{endpoint.description}</p>

          <div className="request-url-section">
            <label className="section-label">Request URL</label>
            <div className="url-box">
              <code>{endpoint.path}</code>
            </div>
          </div>

          <Tabs defaultValue="request" className="endpoint-tabs">
            <TabsList className="tabs-list">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="tab-content">
              {endpoint.params && endpoint.params.length > 0 && (
                <div className="params-section">
                  <h4 className="section-title">Path Parameters</h4>
                  {endpoint.params.map(param => (
                    <div key={param.name} className="param-input-group">
                      <label className="param-label">
                        {param.name} <span className="param-type">({param.type})</span>
                      </label>
                      <Input
                        placeholder={param.description}
                        value={pathParams[param.name] || ''}
                        onChange={(e) => setPathParams({ ...pathParams, [param.name]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}

              {(endpoint.auth?.includes('Bearer') || endpoint.auth?.includes('CLI')) && (
                <div className="auth-section">
                  <h4 className="section-title">Authorization</h4>
                  <div className="param-input-group">
                    <label className="param-label">Bearer Token / CLI Token</label>
                    <Input
                      placeholder="envmgr_xxxxx"
                      value={bearerToken}
                      onChange={(e) => setBearerToken(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {endpoint.bodySchema && endpoint.bodySchema.length > 0 && (
                <div className="body-section">
                  <div className="body-header">
                    <h4 className="section-title">Request Body</h4>
                    <Badge variant="destructive" className="required-badge">Required</Badge>
                  </div>
                  
                  <Badge variant="secondary" className="content-type-badge">application/json</Badge>

                  <div className="schema-table-wrapper">
                    <table className="schema-table">
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Type</th>
                          <th>Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.bodySchema.map((field) => (
                          <tr key={field.property}>
                            <td>
                              {field.property}
                              {field.required && <span className="required-star">*</span>}
                            </td>
                            <td>
                              <code className="type-code">{field.type}</code>
                            </td>
                            <td>
                              <code className="example-code">{typeof field.example === 'object' ? JSON.stringify(field.example) : (field.example || '-')}</code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="example-section">
                    <h5 className="example-title">Example</h5>
                    <pre className="example-code-block">
                      <code>{JSON.stringify(endpoint.body, null, 2)}</code>
                    </pre>
                  </div>

                  <div className="edit-section">
                    <h5 className="example-title">Edit Request Body</h5>
                    <Textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      rows={8}
                      className="json-editor"
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handleExecute}
                disabled={loading}
                className="execute-button"
              >
                {loading ? 'Executing...' : 'Execute'}
              </Button>
            </TabsContent>

            <TabsContent value="responses" className="tab-content">
              <div className="responses-section">
                <h4 className="section-title">Possible Responses</h4>
                <div className="responses-list">
                  {Object.entries(endpoint.responses).map(([code, desc]) => (
                    <div key={code} className="response-item">
                      <Badge variant="outline" className="status-code-badge">{code}</Badge>
                      <span className="response-desc">{desc as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              {response && (
                <>
                  <Separator className="my-6" />
                  <div className="actual-response">
                    <div className="response-header">
                      <h4 className="section-title">Actual Response</h4>
                      <div className="response-badges">
                        <Badge variant="secondary" className="duration-badge">
                          {response.duration}ms
                        </Badge>
                        <Badge className={response.status >= 200 && response.status < 300 ? 'status-success' : 'status-error'}>
                          {response.status} {response.statusText}
                        </Badge>
                      </div>
                    </div>
                    <pre className="response-code-block">
                      <code>{typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}</code>
                    </pre>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

export default function ApiDocsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEndpoints = Object.entries(endpoints).reduce((acc, [category, items]) => {
    const filtered = items.filter(endpoint => 
      endpoint.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as typeof endpoints);

  return (
    <div className="api-docs-container">
      <div className="api-docs-header">
        <div className="header-content">
          <h1 className="header-title">EnvMgr API Documentation</h1>
          <p className="header-subtitle">Interactive API testing and documentation</p>
        </div>
      </div>

      <div className="api-docs-content">
        <div className="search-section">
          <Input
            type="text"
            placeholder="Search endpoints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {Object.entries(filteredEndpoints).map(([category, items]) => (
          <div key={category} className="category-section">
            <h2 className="category-title">{category}</h2>
            {items.map((endpoint, index) => (
              <EndpointCard key={index} endpoint={endpoint} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
