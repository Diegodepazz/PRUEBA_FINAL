import { gql } from "apollo-server";

// El schema define:
// - Tipos
// - Queries
// - Mutations
//
// IMPORTANTE: resolvers TIENE que respetar estos nombres y tipos.
export const typeDefs = gql`

    type User {
        _id: ID!
        email: String!
        clothes: [Clothing]!
    }

    type Clothing {
        _id: ID!
        name: String!
        size: String!
        color: String!
        price: Float!
    }

    type Query {
        me: User
        clothes(page: Int, size: Int): [Clothing]!
        clothing(id: ID!): Clothing
    }

    type Mutation {
        register(email: String!, password: String!): String!
        login(email: String!, password: String!): String!
        addClothing(name: String!, size: String!, color: String!, price: Float!): Clothing!
        buyClothing(clothingId: ID!): User!
    }
`