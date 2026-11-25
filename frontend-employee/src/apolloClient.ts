import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// Regular HTTP link for queries & mutations
const httpLink = new HttpLink({
  uri: "https://mealflow-graphql.onrender.com/query",
  credentials: "include",
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: "wss://mealflow-graphql.onrender.com/query",
  connectionParams: () => {
    const token = localStorage.getItem("accessToken");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  },
}));

// Auth middleware (still applies to HTTP)
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("accessToken");
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Split links: send data to each link depending on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client setup
export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
