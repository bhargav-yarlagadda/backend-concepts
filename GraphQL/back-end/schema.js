// type definitions that we want to expose to the GRaphQL API


//! represents a non-nullable field
export const typeDefs = `#graphql
    type Game{
    id:ID!, 
    title:String!,
    platform:[String]!,
    reviews:[Review!]!,
    }
    type Review{
    id:ID!,
    rating:Int!,
    content:String!,
    game:Game!,
    author:Author!,
    }
    type Author{
    id:ID!, 
    name:String!,
    verified:Boolean!,
    reviews:[Review!],
    } 
    type Query{
    reviews:[Review],
    review(id:ID!):Review,
    games:[Game],
    game(id:ID!):Game,
    authors:[Author], 
    author(id:ID!):Author,

    }


`
/*
📘 GraphQL Schema Overview

GraphQL has 5 built-in scalar types:
-------------------------------------
1. Int      -> Integer (e.g., 1, 2, 100)
2. Float    -> Decimal number (e.g., 3.14)
3. String   -> Text (e.g., "hello")
4. Boolean  -> true or false
5. ID       -> A unique identifier (used for entities like Game, Review, Author)

GraphQL Schema Syntax:
-----------------------
- The schema defines how clients can query and what data types they can expect.
- The structure is similar to JSON, but it has its own declaration style.

Basic Type Syntax:
-------------------
type TypeName {
  fieldName: FieldType
  anotherField: AnotherType!
}

Explanation:
------------
- `type` is used to define an object type (like a table in SQL or a class in OOP).
- `!` after a type means the field is **non-nullable** (must always be present).
- Square brackets `[]` denote **lists/arrays** (e.g., [String] means an array of strings).

Example:
--------
type Game {
  id: ID!             // Unique ID, must be present
  title: String!      // Game title, required
  platform: [String]! // List of platforms, required
}

type Review {
  id: ID!
  rating: Int!
  content: String!
}

type Author {
  id: ID!
  name: String!
  verified: Boolean!
}

Root Query Type:
-----------------
type Query {
  games: [Game]       // Fetch all games
  reviews: [Review]   // Fetch all reviews
  authors: [Author]   // Fetch all authors
}
*/
