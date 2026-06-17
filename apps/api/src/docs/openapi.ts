// OpenAPI 3.0 spec for the Farming Assistant API. Hand-maintained so it stays

type SchemaObject = Record<string, unknown>;

const messageSchema: SchemaObject = {
  type: 'object',
  properties: { message: { type: 'string' } },
};

const user: SchemaObject = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string', format: 'email' },
    isAdmin: { type: 'boolean' },
    isVerified: { type: 'boolean' },
    lastLogin: { type: 'string', format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const product: SchemaObject = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    title: { type: 'string' },
    desc: { type: 'string' },
    img: { type: 'string', description: 'CloudFront image URL' },
    categories: { type: 'array', items: { type: 'string' } },
    type: { type: 'array', items: { type: 'string' } },
    price: { type: 'number' },
    inStock: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const cart: SchemaObject = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    userId: { type: 'string' },
    products: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          quantity: { type: 'integer' },
        },
      },
    },
  },
};

const order: SchemaObject = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    userId: { type: 'string' },
    products: {
      type: 'array',
      items: {
        type: 'object',
        properties: { productId: { type: 'string' }, quantity: { type: 'integer' } },
      },
    },
    amount: { type: 'number' },
    address: { type: 'object' },
    status: { type: 'string', example: 'pending' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const wishlist: SchemaObject = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    userId: { type: 'string' },
    products: {
      type: 'array',
      items: { type: 'object', properties: { productId: { type: 'string' } } },
    },
  },
};

// Reusable responses
const r: Record<number, SchemaObject> = {
  400: { description: 'Validation error', content: { 'application/json': { schema: messageSchema } } },
  401: { description: 'Not authenticated', content: { 'application/json': { schema: messageSchema } } },
  403: { description: 'Not authorized', content: { 'application/json': { schema: messageSchema } } },
  404: { description: 'Not found', content: { 'application/json': { schema: messageSchema } } },
  409: { description: 'Conflict / duplicate', content: { 'application/json': { schema: messageSchema } } },
};

const jsonBody = (schema: SchemaObject): SchemaObject => ({ required: true, content: { 'application/json': { schema } } });
const jsonResp = (description: string, schema: SchemaObject): SchemaObject => ({ description, content: { 'application/json': { schema } } });

const openapiSpec: Record<string, unknown> = {
  openapi: '3.0.3',
  info: {
    title: 'Farming Assistant API',
    version: '1.0.0',
    description:
      'eCommerce backend. Auth uses httpOnly cookies: a 15-minute access token '
      + '(`token`) and a 7-day rotating refresh token (`refreshToken`). On a 401, '
      + 'call `POST /auth/refresh` to mint a new access token.',
  },
  servers: [{ url: '/api', description: 'API root' }],
  tags: [
    { name: 'Auth' },
    { name: 'Products' },
    { name: 'Cart' },
    { name: 'Orders' },
    { name: 'Wishlist' },
    { name: 'Checkout' },
    { name: 'Users (admin)' },
    { name: 'Newsletter' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
    },
    schemas: {
      User: user,
      Product: product,
      Cart: cart,
      Order: order,
      Wishlist: wishlist,
      Message: messageSchema,
    },
  },
  paths: {
    // ─── Auth ────────────────────────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user (sets auth cookies)',
        requestBody: jsonBody({
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        }),
        responses: { 201: jsonResp('Created', user), 400: r[400], 409: r[409] },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in (sets access + refresh cookies)',
        requestBody: jsonBody({
          type: 'object',
          required: ['username', 'password'],
          properties: { username: { type: 'string' }, password: { type: 'string' } },
        }),
        responses: { 200: jsonResp('OK', user), 400: r[400], 401: r[401] },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token and issue a new access token',
        responses: { 200: jsonResp('OK', { type: 'object', properties: { success: { type: 'boolean' }, user } }), 401: r[401] },
      },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Log out (clears cookies, revokes refresh token)', responses: { 200: jsonResp('OK', messageSchema) } },
    },
    '/auth/check-auth': {
      get: {
        tags: ['Auth'],
        summary: 'Return the current user from the access cookie',
        security: [{ cookieAuth: [] }],
        responses: { 200: jsonResp('OK', { type: 'object', properties: { success: { type: 'boolean' }, user } }), 401: r[401] },
      },
    },
    '/auth/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verify email with the 6-digit code',
        requestBody: jsonBody({ type: 'object', required: ['code'], properties: { code: { type: 'string' } } }),
        responses: { 200: jsonResp('Verified', { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, user } }), 400: r[400] },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Email a password reset link',
        requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }),
        responses: { 200: jsonResp('Sent', messageSchema), 400: r[400] },
      },
    },
    '/auth/reset-password/{token}': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using the emailed token',
        parameters: [{
          name: 'token', in: 'path', required: true, schema: { type: 'string' },
        }],
        requestBody: jsonBody({ type: 'object', required: ['password'], properties: { password: { type: 'string', minLength: 6 } } }),
        responses: { 200: jsonResp('Reset', messageSchema), 400: r[400] },
      },
    },

    // ─── Products ──────────────────────────────────────────────────────────
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products (public)',
        parameters: [
          {
            name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category',
          },
          {
            name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search title/desc/category',
          },
          {
            name: 'new', in: 'query', schema: { type: 'string' }, description: 'Latest 5 if present',
          },
        ],
        responses: { 200: jsonResp('OK', { type: 'array', items: product }) },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product (admin)',
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody(product),
        responses: {
          201: jsonResp('Created', product), 401: r[401], 403: r[403], 409: r[409],
        },
      },
    },
    '/products/find/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by id (public)',
        parameters: [{
          name: 'id', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('OK', product), 400: r[400], 404: r[404] },
      },
    },
    '/products/{id}': {
      put: {
        tags: ['Products'],
        summary: 'Update a product (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'id', in: 'path', required: true, schema: { type: 'string' },
        }],
        requestBody: jsonBody(product),
        responses: { 200: jsonResp('OK', product), 403: r[403], 404: r[404] },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete a product (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'id', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('Deleted', messageSchema), 403: r[403], 404: r[404] },
      },
    },
    '/products/upload-url': {
      post: {
        tags: ['Products'],
        summary: 'Get a presigned S3 upload URL for a product image (admin)',
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({
          type: 'object',
          required: ['contentType'],
          properties: { contentType: { type: 'string', example: 'image/png' } },
        }),
        responses: {
          201: jsonResp('Presigned', {
            type: 'object',
            properties: {
              uploadUrl: { type: 'string' },
              key: { type: 'string' },
              fileUrl: { type: 'string', description: 'CloudFront URL to store as product.img' },
              expiresIn: { type: 'integer' },
            },
          }),
          400: r[400],
          403: r[403],
          503: jsonResp('Image storage not configured', messageSchema),
        },
      },
    },

    // ─── Cart ────────────────────────────────────────────────────────────────
    '/carts/find/{userId}': {
      get: {
        tags: ['Cart'],
        summary: "Get a user's cart (owner or admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'userId', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('OK', cart), 401: r[401], 403: r[403] },
      },
      put: {
        tags: ['Cart'],
        summary: "Replace a user's cart (owner or admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'userId', in: 'path', required: true, schema: { type: 'string' },
        }],
        requestBody: jsonBody({ type: 'object', properties: { products: (cart.properties as SchemaObject).products } }),
        responses: { 200: jsonResp('OK', cart), 403: r[403] },
      },
    },
    '/carts': {
      post: {
        tags: ['Cart'],
        summary: 'Create the caller\'s cart',
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({ type: 'object', properties: { products: (cart.properties as SchemaObject).products } }),
        responses: { 201: jsonResp('Created', cart), 401: r[401] },
      },
      get: {
        tags: ['Cart'], summary: 'List all carts (admin)', security: [{ cookieAuth: [] }], responses: { 200: jsonResp('OK', { type: 'array', items: cart }), 403: r[403] },
      },
    },

    // ─── Orders ──────────────────────────────────────────────────────────────
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create an order (attributed to the caller)',
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({
          type: 'object',
          required: ['amount', 'address'],
          properties: { products: (order.properties as SchemaObject).products, amount: { type: 'number' }, address: { type: 'object' } },
        }),
        responses: { 201: jsonResp('Created', order), 400: r[400], 401: r[401] },
      },
      get: {
        tags: ['Orders'], summary: 'List all orders (admin)', security: [{ cookieAuth: [] }], responses: { 200: jsonResp('OK', { type: 'array', items: order }), 403: r[403] },
      },
    },
    '/orders/find/{userId}': {
      get: {
        tags: ['Orders'],
        summary: "Get a user's orders (owner or admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'userId', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('OK', { type: 'array', items: order }), 403: r[403] },
      },
    },
    '/orders/{id}': {
      put: {
        tags: ['Orders'],
        summary: 'Update an order (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'id', in: 'path', required: true, schema: { type: 'string' },
        }],
        requestBody: jsonBody(order),
        responses: { 200: jsonResp('OK', order), 403: r[403], 404: r[404] },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Delete an order (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'id', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('Deleted', messageSchema), 403: r[403], 404: r[404] },
      },
    },
    '/orders/income': {
      get: {
        tags: ['Orders'], summary: 'Monthly income stats (admin)', security: [{ cookieAuth: [] }], responses: { 200: jsonResp('OK', { type: 'array', items: { type: 'object' } }), 403: r[403] },
      },
    },

    // ─── Wishlist ──────────────────────────────────────────────────────────
    '/wishlist/find/{userId}': {
      get: {
        tags: ['Wishlist'],
        summary: "Get a user's wishlist (owner or admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'userId', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('OK', wishlist), 403: r[403] },
      },
      put: {
        tags: ['Wishlist'],
        summary: "Replace a user's wishlist (owner or admin)",
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'userId', in: 'path', required: true, schema: { type: 'string' },
        }],
        requestBody: jsonBody({ type: 'object', properties: { products: (wishlist.properties as SchemaObject).products } }),
        responses: { 200: jsonResp('OK', wishlist), 403: r[403] },
      },
    },
    '/wishlist/{productId}': {
      post: {
        tags: ['Wishlist'],
        summary: 'Add a product to the wishlist (idempotent)',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'productId', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('OK', wishlist), 401: r[401] },
      },
      delete: {
        tags: ['Wishlist'],
        summary: 'Remove a product from the wishlist',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'productId', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('OK', wishlist), 401: r[401] },
      },
    },

    // ─── Checkout (Stripe) ─────────────────────────────────────────────────
    '/checkout/create-embedded-session': {
      post: {
        tags: ['Checkout'],
        summary: 'Create an embedded Stripe Checkout session',
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({ type: 'object', required: ['products'], properties: { products: { type: 'array', items: product } } }),
        responses: { 201: jsonResp('Created', { type: 'object', properties: { clientSecret: { type: 'string' } } }), 400: r[400], 401: r[401] },
      },
    },
    '/checkout/create-checkout-session': {
      post: {
        tags: ['Checkout'],
        summary: 'Create a hosted (redirect) Stripe Checkout session',
        security: [{ cookieAuth: [] }],
        requestBody: jsonBody({ type: 'object', required: ['products'], properties: { products: { type: 'array', items: product } } }),
        responses: { 201: jsonResp('Created', { type: 'object', properties: { id: { type: 'string' }, url: { type: 'string' } } }), 400: r[400], 401: r[401] },
      },
    },
    '/checkout/session/{id}': {
      get: {
        tags: ['Checkout'],
        summary: 'Retrieve a checkout session status',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'id', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('OK', { type: 'object' }), 401: r[401] },
      },
    },

    // ─── Users (admin) ─────────────────────────────────────────────────────
    '/users': {
      get: {
        tags: ['Users (admin)'], summary: 'List users (admin)', security: [{ cookieAuth: [] }], responses: { 200: jsonResp('OK', { type: 'array', items: user }), 403: r[403] },
      },
    },
    '/users/find/{id}': {
      get: {
        tags: ['Users (admin)'],
        summary: 'Get a user (admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'id', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('OK', user), 403: r[403], 404: r[404] },
      },
    },
    '/users/{id}': {
      put: {
        tags: ['Users (admin)'],
        summary: 'Update a user (owner or admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'id', in: 'path', required: true, schema: { type: 'string' },
        }],
        requestBody: jsonBody({ type: 'object', properties: { username: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } }),
        responses: { 200: jsonResp('OK', user), 403: r[403], 404: r[404] },
      },
      delete: {
        tags: ['Users (admin)'],
        summary: 'Delete a user (owner or admin)',
        security: [{ cookieAuth: [] }],
        parameters: [{
          name: 'id', in: 'path', required: true, schema: { type: 'string' },
        }],
        responses: { 200: jsonResp('Deleted', messageSchema), 403: r[403], 404: r[404] },
      },
    },
    '/users/stats': {
      get: {
        tags: ['Users (admin)'], summary: 'User signup stats (admin)', security: [{ cookieAuth: [] }], responses: { 200: jsonResp('OK', { type: 'array', items: { type: 'object' } }), 403: r[403] },
      },
    },

    // ─── Newsletter ────────────────────────────────────────────────────────
    '/subscribe': {
      post: {
        tags: ['Newsletter'],
        summary: 'Subscribe an email to the newsletter',
        requestBody: jsonBody({ type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }),
        responses: { 201: jsonResp('Subscribed', messageSchema), 400: r[400], 409: r[409] },
      },
    },
  },
};

export default openapiSpec;
