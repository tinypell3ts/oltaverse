import { gql, request } from "graphql-request";
import { useQuery } from "react-query";
import { SUBGRAPH_ENDPOINT } from "../constants";

export default function useGetPurchases(creator: string, refetchInterval = 0) {
  return useQuery(
    ["artwork", creator],
    async () => {
      const data = await request(
        SUBGRAPH_ENDPOINT,
        gql`
          query {
            tokenContracts(where: { creator: "${creator}" }) {
              id
              creator {
                id
              }
              versions {
                animation {
                  url
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
