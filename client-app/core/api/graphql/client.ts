import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { onError } from "apollo-link-error";
import { HttpLink } from "apollo-link-http";
import fetch from "isomorphic-fetch";
import { pageReloadEvent, useBroadcast } from "@/shared/broadcast";
import type { FetchPolicy } from "apollo-client";

const fetchPolicy: FetchPolicy = "no-cache";

const httpLink = new HttpLink({ uri: `/xapi/graphql`, fetch });

const broadcast = useBroadcast();

const errorHandler = onError(({ graphQLErrors = [] }) => {
  for (let l = graphQLErrors.length, i = 0; i < l; i += 1) {
    const {
      extensions: { code },
    } = graphQLErrors[i];

    if (code === "Unauthorized") {
      broadcast.emit(pageReloadEvent);
      const { hash, pathname, search } = location;
      location.href = `/sign-in?returnUrl=${pathname + search + hash}`;
      return;
    }

    if (code === "Forbidden") {
      // TODO: Use notification
      alert("User doesn't have the required permission.");
    }
  }
});

export const graphqlClient = new ApolloClient({
  // Provide required constructor fields
  link: errorHandler.concat(httpLink),
  cache: new InMemoryCache({
    freezeResults: true,
    addTypename: false,
  }),

  // Provide some optional constructor fields
  name: "x-api-graphql-client",
  connectToDevTools: true,
  assumeImmutableResults: true,
  queryDeduplication: false,

  defaultOptions: {
    watchQuery: { fetchPolicy },
    query: { fetchPolicy },
    mutate: { fetchPolicy },
  },
});