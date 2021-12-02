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
