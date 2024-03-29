import { useApolloClient } from "@vue/apollo-composable";
import { useCartMutationVariables } from "@/core/api/graphql/cart/composables";
import { useMutation } from "@/core/api/graphql/composables";
import { ChangeShortCartItemQuantityDocument, OperationNames } from "@/core/api/graphql/types";
import { filterActiveQueryNames } from "@/core/api/graphql/utils";
import type { CartIdFragment } from "@/core/api/graphql/types";
import type { MaybeRef } from "vue";

export function useChangeShortCartItemQuantityMutation(cart?: MaybeRef<CartIdFragment | undefined>) {
  const { client } = useApolloClient();
  return useMutation(
    ChangeShortCartItemQuantityDocument,
    useCartMutationVariables(cart, {
      refetchQueries: () => filterActiveQueryNames(client, [OperationNames.Query.GetFullCart]),
    }),
  );
}
