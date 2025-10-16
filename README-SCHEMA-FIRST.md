# Schema-First GraphQL Approach

This branch demonstrates the **schema-first** approach to GraphQL in NestJS. For the **code-first** approach, see the `main` branch.

## Table of Contents

- [Overview](#overview)
- [Key Differences](#key-differences)
- [Approach Comparison](#approach-comparison)
- [Implementation Details](#implementation-details)
- [Best Practices](#best-practices)
- [When to Use Each Approach](#when-to-use-each-approach)

## Overview

### Code-First (main branch)
- TypeScript decorators define the GraphQL schema
- Schema is auto-generated from TypeScript classes
- Single source of truth: **TypeScript code**

### Schema-First (this branch)
- Manual `.graphql` files define the GraphQL schema
- TypeScript types are generated from the schema
- Single source of truth: **GraphQL schema files**

## Key Differences

### 1. Schema Definition

**Code-First:**
```typescript
// src/users/entities/user.entity.ts
@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryKey()
  id!: number;

  @Field()
  @Property()
  name!: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.author)
  posts = new Collection<Post>(this);
}
```

**Schema-First:**
```graphql
# src/schema/user.graphql
type User {
  id: Int!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

```typescript
// src/users/entities/user.entity.ts
@Entity()  // Only MikroORM decorator, no GraphQL decorators
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @OneToMany(() => Post, (post) => post.author)
  posts = new Collection<Post>(this);
}
```

### 2. Module Configuration

**Code-First:**
```typescript
// src/app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),  // Auto-generate schema
  playground: true,
})
```

**Schema-First:**
```typescript
// src/app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  typePaths: ['./**/*.graphql'],  // Load manual schema files
  definitions: {
    path: join(process.cwd(), 'src/graphql.ts'),  // Generate TypeScript types
    outputAs: 'class',
  },
  playground: true,
})
```

### 3. Resolver Implementation

**Code-First:**
```typescript
// src/users/users.resolver.ts
@Resolver(() => User)  // Type-based resolver
export class UsersResolver {
  @Query(() => [User], { name: 'users' })  // Explicit return type
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Mutation(() => User)  // Explicit return type
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.usersService.create(input);
  }
}
```

**Schema-First:**
```typescript
// src/users/users.resolver.ts
@Resolver('User')  // String-based resolver
export class UsersResolver {
  @Query('users')  // References schema query name
  async users(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Mutation('createUser')  // References schema mutation name
  async createUser(@Args('input') input: CreateUserInput): Promise<UserEntity> {
    // Convert null to undefined for DTO compatibility
    const dto = {
      name: input.name,
      email: input.email,
      bio: input.bio ?? undefined,
    };
    return this.usersService.create(dto);
  }

  // Field resolver for relationship
  @ResolveField('posts')
  async posts(@Parent() user: UserEntity): Promise<PostEntity[]> {
    await user.posts.loadItems();
    return user.posts.getItems();
  }
}
```

### 4. Type Generation

**Code-First:**
- No type generation needed
- TypeScript types ARE the source
- GraphQL schema generated automatically

**Schema-First:**
- TypeScript types generated from `.graphql` files
- Generated types in `src/graphql.ts`
- Generation happens on app startup or build

Generated types example:
```typescript
// src/graphql.ts (auto-generated)
export class User {
  id: number;
  name: string;
  email: string;
  bio?: Nullable<string>;
  posts: Post[];
  createdAt: DateTime;
  updatedAt: DateTime;
}

export class CreateUserInput {
  name: string;
  email: string;
  bio?: Nullable<string>;
}
```

## Implementation Details

### Field Resolvers (Best Practice for Schema-First)

Schema-first approach with MikroORM requires field resolvers to handle relationships properly:

```typescript
@ResolveField('posts')
async posts(@Parent() user: UserEntity): Promise<PostEntity[]> {
  // Load OneToMany collection
  await user.posts.loadItems();
  return user.posts.getItems();
}

@ResolveField('author')
async author(@Parent() post: PostEntity): Promise<UserEntity> {
  // Load ManyToOne relation using wrap()
  await wrap(post.author).init();
  return post.author;
}
```

**Why field resolvers?**
- Separates GraphQL concerns from entity definitions
- Handles MikroORM `Collection<T>` to `T[]` conversion
- Allows lazy loading of relations
- Follows GraphQL best practices for the "N+1 problem" (can be optimized with DataLoader)

### Handling Nullable Types

GraphQL schema uses `null` for optional values, but TypeScript/Zod prefer `undefined`:

```typescript
@Mutation('createUser')
async createUser(@Args('input') input: CreateUserInput): Promise<UserEntity> {
  // Convert GraphQL null to TypeScript undefined
  const dto = {
    name: input.name,
    email: input.email,
    bio: input.bio ?? undefined,  // null | undefined => undefined
  };
  return this.usersService.create(dto);
}
```

### ID Type Considerations

GraphQL `ID` scalar is typically represented as `string`, but MikroORM uses `number` for auto-increment IDs:

```graphql
# Use Int! instead of ID! when working with numeric database IDs
type User {
  id: Int!  # Not ID!
  name: String!
}
```

## Best Practices

### Schema-First Best Practices

1. **Separate schema files by domain**
   ```
   src/schema/
   ├── schema.graphql (root types + scalars)
   ├── user.graphql (User types)
   └── post.graphql (Post types)
   ```

2. **Use field resolvers for relationships**
   - Keeps entity classes clean (only ORM decorators)
   - Provides fine-grained control over data loading
   - Better separation of concerns

3. **Handle type conversions explicitly**
   - Convert `null` to `undefined` for service layer
   - Use proper types (Int vs ID)
   - Add comments explaining conversions

4. **Keep entities ORM-focused**
   - No GraphQL decorators on entities
   - Entities represent database structure
   - Resolvers handle GraphQL concerns

### Code-First Best Practices

1. **Co-locate GraphQL and ORM decorators**
   - Entities define both database and GraphQL structure
   - Single source of truth
   - Type safety guaranteed by TypeScript

2. **Use DTOs for input types**
   - Separate input types from entities
   - Add validation with Zod or class-validator

3. **Leverage TypeScript inference**
   - Less boilerplate
   - Compiler catches schema mistakes

## When to Use Each Approach

### Use Code-First When:

- ✅ Team is TypeScript-first
- ✅ Rapid prototyping and iteration
- ✅ You want automatic schema generation
- ✅ Prefer fewer files and less boilerplate
- ✅ Type safety is the top priority
- ✅ Small to medium-sized projects

**Advantages:**
- Less code duplication
- Automatic type safety
- Faster development
- Single source of truth (TypeScript)

**Disadvantages:**
- Less control over exact schema output
- Harder for frontend developers to contribute to schema
- Schema documentation requires additional tooling

### Use Schema-First When:

- ✅ GraphQL schema is the contract between teams
- ✅ Non-TypeScript clients need the schema
- ✅ Frontend and backend teams work independently
- ✅ You want full control over schema structure
- ✅ API design comes before implementation
- ✅ Large projects with multiple teams

**Advantages:**
- Schema is language-agnostic
- Clear API contract before implementation
- Easier for frontend developers to contribute
- Better for API-first development
- More explicit control over schema

**Disadvantages:**
- More boilerplate code
- Need to maintain schema files and TypeScript types
- Type generation adds build step
- Potential for schema/code drift

## Repository Structure Comparison

### Code-First (main branch)
```
src/
├── app.module.ts (autoSchemaFile config)
├── users/
│   ├── entities/
│   │   └── user.entity.ts (@ObjectType + @Entity decorators)
│   ├── dto/
│   │   ├── create-user.input.ts (@InputType decorator)
│   │   └── update-user.input.ts (@InputType decorator)
│   ├── users.resolver.ts (@Resolver(() => User))
│   └── users.service.ts
└── schema.gql (auto-generated)
```

### Schema-First (this branch)
```
src/
├── app.module.ts (typePaths config)
├── schema/
│   ├── schema.graphql (root types)
│   ├── user.graphql (User schema)
│   └── post.graphql (Post schema)
├── users/
│   ├── entities/
│   │   └── user.entity.ts (only @Entity decorator)
│   ├── dto/
│   │   ├── create-user.input.ts (Zod schemas only)
│   │   └── update-user.input.ts (Zod schemas only)
│   ├── users.resolver.ts (@Resolver('User') + @ResolveField)
│   └── users.service.ts
└── graphql.ts (auto-generated types)
```

## Migration Between Approaches

Both approaches can coexist in the same codebase, but it's not recommended. Choose one and stick with it for consistency.

To switch from code-first to schema-first:
1. Export the auto-generated schema file
2. Split it into multiple `.graphql` files
3. Update module configuration
4. Remove GraphQL decorators from entities
5. Add field resolvers for relationships
6. Update resolvers to use string-based decorators

To switch from schema-first to code-first:
1. Add GraphQL decorators to entities
2. Update module configuration to use `autoSchemaFile`
3. Remove manual `.graphql` files
4. Remove field resolvers (optional)
5. Update resolvers to use type-based decorators

## Conclusion

Both approaches are valid and have their use cases. This PoC demonstrates both so you can make an informed decision based on your project's needs.

**Quick Decision Guide:**
- **Startup/Small team** → Code-First
- **Multiple teams/Large project** → Schema-First
- **TypeScript-only** → Code-First
- **Multi-language** → Schema-First
- **Fast iteration** → Code-First
- **API contract-driven** → Schema-First
