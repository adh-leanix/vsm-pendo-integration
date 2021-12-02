import * as dotenv from 'dotenv';
import _ from 'lodash';
import { WRITE_USAGE_MUTATION } from './constants';
import { getLxAccessToken, getPendoReport, getAllAccountFactSheets, lxGqlWriteFsRequest } from './helpers';
import { PendoReportData } from './types';

dotenv.config();

(async () => {
  try {
    const PENDO_API_KEY = process.env.PENDO_API_KEY;
    const LX_API_TOKEN = process.env.LX_API_TOKEN;

    if (!PENDO_API_KEY) {
      throw new Error('PENDO_API_KEY is required');
    }

    if (!LX_API_TOKEN) {
      throw new Error('LX_API_TOKEN is required');
    }

    // Get Pendo data from the API
    const pendoReportId = 'BBVrRsvRtHYrgDsrtBKttrqejRU';

    const pendoReportData = await getPendoReport<PendoReportData[]>(PENDO_API_KEY, pendoReportId);

    // Get all the accounts
    const lxInstance = 'leanix.leanix.net';
    const lxAccessToken = await getLxAccessToken(lxInstance, LX_API_TOKEN);

    const data = await getAllAccountFactSheets(lxInstance, lxAccessToken);
    const workspaces = data.filter((account) => account.category === 'workspace');
    const workspaceIds = workspaces.map((w) => w.lxMTMWorkspaceId.externalId);

    // Filter Pendo Report Data
    const filteredPendoReportData = pendoReportData.filter((pendoData) => workspaceIds.includes(pendoData.visitor_agent_workspace_id));
    const accounts = filteredPendoReportData.reduce<Record<string, PendoReportData[]>>((acc, data) => {
      const key = data.account_auto_id;
      if (!(key in acc)) {
        acc[key] = [data];
      } else {
        acc[key].push(data);
      }
      return acc;
    }, {});

    const updatesAccountValues = _.mapValues(accounts, (account) => {
      const lxLastVisitDate = _.get(
        _.first(account.sort((x, y) => y.visitor_auto_lastvisit - x.visitor_auto_lastvisit)),
        'visitor_auto_lastvisit'
      );
      const lxLastVisitDateFormatted = new Date(lxLastVisitDate!);
      const workspace = account[0].visitor_agent_workspace_id;
      return {
        accountFsId: _.get(
          workspaces.find((value) => value.lxMTMWorkspaceId.externalId === workspace),
          'id'
        ),
        lxNumberOfVisitorsLast30Day: account.length,
        lxLastVisitDate: lxLastVisitDateFormatted.toISOString()
      };
    });

    for (const fs of Object.values(updatesAccountValues)) {
      // Write Data to lx Workspace
      const data = await lxGqlWriteFsRequest(lxInstance, lxAccessToken, WRITE_USAGE_MUTATION, {
        id: _.get(fs, 'id'),
        patches: [
          {
            op: 'replace',
            path: '/lxNumberOfVisitorsLast30Day',
            value: String(_.get(fs, 'lxNumberOfVisitorsLast30Day'))
          },
          {
            op: 'replace',
            path: '/lxLastVisitDate',
            value: _.get(fs, 'lxLastVisitDate')
          }
        ]
      });

      console.log(data);
    }
  } catch (error) {
    console.log(error);
    process.exit(-1);
  }
})();
