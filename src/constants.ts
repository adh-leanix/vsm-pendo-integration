export const WRITE_USAGE_MUTATION = `
    mutation ($id: ID!, $patches: [Patch]!) {
        result: updateFactSheet(id: $id, patches: $patches, validateOnly: false) {
            factSheet {
                ... on Account {
                    displayName
                    description
                    lxNumberOfVisitorsLast30Day
                    lxLastVisitDate
                }
            }
        }
    }
`;

export const GET_ALL_ACCOUNT_FACT_SHEETS = `
query{
    allFactSheets(filter: {facetFilters: [{facetKey: "FactSheetTypes", keys: ["Account"]}]}) {
      totalCount
      edges {
        node {
          id
          displayName
          category
          ... on Account {
            lxMTMWorkspaceId {
                externalId
              }
          } 
        }
      }
    }
  }
`;
