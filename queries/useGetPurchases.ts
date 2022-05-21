import { gql, request } from "graphql-request";
import { useQuery } from "react-query";
import { SUBGRAPH_ENDPOINT } from "../constants";

export default function useGetPurchases(refetchInterval = 0) {
  return useQuery(
    ["tokenContracts"],
    async () => {
      const data = await request(
        SUBGRAPH_ENDPOINT,
        gql`
          query {
            tokenContract(id: "0x90289cc9e174fc27017a8615a657ceeaabe363b1") {
              id
              tokens {
                id
                seed
                owner {
                  id
                }
              }
            }
          }
        `
      );

      return data;
    },
    { refetchInterval }
  );
}
