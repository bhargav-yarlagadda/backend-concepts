# GraphQL Backend Concepts

## Table of Contents

- [What is GraphQL?](#what-is-graphql)
- [What is Apollo Server?](#what-is-apollo-server)
- [What are typeDefs?](#what-are-typedefs)
- [Why do we need typeDefs?](#why-do-we-need-typedefs)
- [What are Resolvers?](#what-are-resolvers)
- [Using Resolvers to Create Relationships](#using-resolvers-to-create-relationships)
- [Querying Data](#querying-data)
- [How to Run This Project](#how-to-run-this-project)

---

## What is GraphQL?

GraphQL is a query language for APIs and a runtime for executing those queries with your existing data. It allows clients to request exactly the data they need, making APIs more flexible and efficient compared to REST.

**Key Features:**

- Clients specify the structure of the response.
- Strongly typed schema.
- Single endpoint for all data fetching.
- Real-time updates with subscriptions (advanced).

---

## What is Apollo Server?

Apollo Server is a popular open-source GraphQL server for Node.js. It makes it easy to build a production-ready, self-documenting GraphQL API.

**Features:**

- Integrates with any Node.js HTTP server.
- Works with any GraphQL schema.
- Provides tools for performance monitoring and error tracking.

---

## What are typeDefs?

`typeDefs` (type definitions) define the structure of your GraphQL API. They describe the types (objects, queries, mutations, etc.) and how they relate to each other.

**Example:**

```graphql
type Game {
  id: ID!
  title: String!
  reviews: [Review]
}
```

---

## Why do we need typeDefs?

- They act as a contract between the client and server.
- Ensure that queries and mutations are valid.
- Enable tools like auto-completion and documentation.

---

## What are Resolvers?

Resolvers are functions that provide the instructions for turning a GraphQL operation (a query, mutation, or subscription) into data.

**Example:**

```js
const resolvers = {
  Query: {
    games: () => _db.games,
  },
  Game: {
    reviews: (parent) => _db.reviews.filter((r) => r.game_id === parent.id),
  },
};
```

---

## Using Resolvers to Create Relationships

Resolvers can be used to define relationships between types. For example, a `Game` can have many `Review`s, and a `Review` can have an `Author`.

**Example:**

```js
Game: {
  reviews(parent) {
    return _db.reviews.filter(review => review.game_id === parent.id);
  }
},
Review: {
  author(parent) {
    return _db.authors.find(author => author.id === parent.author_id);
  }
}
```

---

## Querying Data

You can query data using the GraphQL playground or any GraphQL client. Example queries:

**Get all games:**

```graphql
query {
  games {
    id
    title
    reviews {
      rating
      content
    }
  }
}
```

**Get a specific review:**

```graphql
query {
  reviews(id: "1") {
    content
    author {
      name
    }
  }
}
```

---

## How to Run This Project

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Start the server:
   ```powershell
   npm start
   ```
3. Open your browser and go to `http://localhost:4000` to access the GraphQL playground.

---

**Happy Learning GraphQL!**
