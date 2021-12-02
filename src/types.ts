export interface PendoReportData {
  account_agent_name: string;
  visitor_agent_workspace_id: string;
  visitor_auto_lastvisit: number;
  visitorId: string;
  account_auto_id: string;
}

export interface AccountFactSheet {
  id: string;
  displayName: string;
  category: 'workspace' | 'company';
  lxMTMWorkspaceId: { externalId: string };
}
