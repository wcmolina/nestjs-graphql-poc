# NestJS GraphQL PoC

A proof of concept demonstrating how to build a GraphQL API with NestJS, using modern dependencies including Apollo Server, MikroORM, and PostgreSQL.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **GraphQL** - Query language for APIs
- **Apollo Server** - GraphQL server implementation
- **MikroORM** - TypeScript ORM with support for PostgreSQL
- **PostgreSQL** - Relational database
- **Zod** - TypeScript-first schema validation
- **Docker** - Container platform for running PostgreSQL

## Project Structure

```
src/
├── users/
│   ├── entities/user.entity.ts      # User entity with MikroORM and GraphQL decorators
│   ├── dto/                          # Input DTOs with Zod validation
│   ├── users.service.ts              # Business logic for users
│   ├── users.resolver.ts             # GraphQL queries and mutations
│   └── users.module.ts
├── posts/
│   ├── entities/post.entity.ts      # Post entity with relationships
│   ├── dto/                          # Input DTOs with Zod validation
│   ├── posts.service.ts              # Business logic for posts
│   ├── posts.resolver.ts             # GraphQL queries and mutations
│   └── posts.module.ts
├── mikro-orm.config.ts              # MikroORM configuration
└── main.ts                           # Application bootstrap
```

## Key Features

### GraphQL vs REST Comparison

This PoC demonstrates key differences between GraphQL and REST:

1. **Single Endpoint**: All queries and mutations go through `/graphql` instead of multiple REST endpoints
2. **Flexible Queries**: Clients can request exactly the data they need
3. **Type Safety**: GraphQL schema provides strong typing across the API
4. **No Over/Under-fetching**: Get exactly what you request
5. **Introspection**: GraphQL Playground provides interactive documentation

### Example Queries

#### Create a User
```graphql
mutation {
  createUser(input: {
    name: "John Doe"
    email: "john@example.com"
    bio: "Software developer"
  }) {
    id
    name
    email
    bio
    createdAt
  }
}
```

#### Get All Users with Their Posts
```graphql
query {
  users {
    id
    name
    email
    posts {
      id
      title
      published
    }
  }
}
```

#### Create a Post
```graphql
mutation {
  createPost(input: {
    title: "Getting Started with GraphQL"
    content: "GraphQL is a query language for APIs..."
    published: true
    authorId: 1
  }) {
    id
    title
    content
    published
    author {
      name
      email
    }
    createdAt
  }
}
```

#### Get a Single Post
```graphql
query {
  post(id: 1) {
    id
    title
    content
    published
    author {
      name
      email
    }
    createdAt
    updatedAt
  }
}
```

#### Update a User
```graphql
mutation {
  updateUser(id: 1, input: {
    bio: "Senior Software Developer"
  }) {
    id
    name
    bio
    updatedAt
  }
}
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- npm or yarn

### Installation & Running

1. **Start PostgreSQL**:
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm run start:dev
   ```

4. **Access GraphQL Playground**:
   Open http://localhost:3000/graphql in your browser

### Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start in production mode
- `npm run start:dev` - Start in development mode with watch
- `npm run lint` - Lint the codebase

## Understanding the Code

### Entity Definition (MikroORM + GraphQL)

```typescript
@ObjectType()  // GraphQL decorator
@Entity()      // MikroORM decorator
export class User {
  @Field(() => ID)
  @PrimaryKey()
  id!: number;

  @Field()
  @Property()
  name!: string;

  // ... more fields
}
```

### GraphQL Resolver

```typescript
@Resolver(() => User)
export class UsersResolver {
  @Query(() => [User], { name: 'users' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.usersService.create(input);
  }
}
```

### Zod Validation

```typescript
export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
});

// Used in service layer
const validatedData = createUserSchema.parse(input);
```

## Database Schema

The application uses two main entities:

- **User**: id, name, email, bio, createdAt, updatedAt
- **Post**: id, title, content, published, authorId, createdAt, updatedAt

Relationships:
- User has many Posts (one-to-many)
- Post belongs to User (many-to-one)

## Learning Resources

### GraphQL Concepts

- **Queries**: Read operations (like GET in REST)
- **Mutations**: Write operations (like POST/PUT/DELETE in REST)
- **Types**: Define the shape of your data
- **Resolvers**: Functions that return data for fields
- **Arguments**: Input parameters for queries/mutations
- **Field Selection**: Request only the fields you need

### GraphQL vs REST

| Feature | REST | GraphQL |
|---------|------|---------|
| Endpoints | Multiple (`/users`, `/posts`) | Single (`/graphql`) |
| Data Fetching | Fixed structure | Flexible queries |
| Over-fetching | Common | Eliminated |
| Versioning | URL-based (`/v1`, `/v2`) | Schema evolution |
| Documentation | Manual (Swagger) | Auto-generated (Introspection) |

## Next Steps

To extend this PoC, consider adding:

1. **Authentication & Authorization** - JWT tokens, role-based access
2. **Subscriptions** - Real-time updates via WebSockets
3. **DataLoader** - Batch and cache database queries
4. **Pagination** - Cursor or offset-based pagination
5. **File Uploads** - Handle multipart form data
6. **Error Handling** - Custom error types and formatting
7. **Testing** - Unit and integration tests for resolvers

## Notes

- This is a PoC without authentication - add auth before production use
- No tests included - focus is on functional code for learning
- Database schema is auto-synced on startup (not recommended for production)
- Uses in-development features for learning purposes

## Generated Schema

The GraphQL schema is auto-generated at `src/schema.gql` (code-first approach) based on your TypeScript decorators.
