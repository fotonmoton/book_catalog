# Simple book catalog

GraphQL API for the following schema:

```GraphQL
type Author {
  id: ID!
  firstName: String!
  lastName: String!
  books: [Book!]!
}

input AuthorInput {
  firstName: String!
  lastName: String!
}

type Book {
  id: ID!
  title: String!
  authors: [Author!]!
}

input BookInput {
  title: String!
  authorIds: [ID!]!
}

type Mutation {
  createAuthor(author: AuthorInput!): Author!
  deleteAuthor(id: ID!): Int!
  deleteAuthorWithBooks(id: ID!): Int!
  createBook(book: BookInput!): Book!
  deleteBook(id: ID!): Int!
  addAuthor(authorId: ID!, bookId: ID!): Book!
}

type Query {
  getAuthor(id: ID!): Author
  getAuthors(maxNumberOfBooks: Int!, minNumberOfBooks: Int!): [Author!]!
  getBook(id: ID!): Book
  getBooks(title: String!): [Book!]!
}
```

Main dependencies for the project are `Docker` and `docker-compose`. 
To run GraphQL playground in production mode type: `./prod.sh up --build`. 
To tinker with code in watch mode run: `./dev.sh up --build`.
After some time playground will be available at `localhost:5000/graphql`.

### TODO

1. Tests
2. Type-safe DB queries
3. DB migrations