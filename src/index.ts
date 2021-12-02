import * as dotenv from 'dotenv';
import { WRITE_USAGE_MUTATION } from './constants';
import { getLxAccessToken, getPendoReport, lxGqlRequest } from './helpers';
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

    const pendoReportData = await getPendoReport<PendoReportData>(PENDO_API_KEY, pendoReportId);
    console.log(pendoReportData);

    // Write Data to lx Workspace
    const lxInstance = 'leanix.leanix.net';
    const lxAccessToken = await getLxAccessToken(lxInstance, LX_API_TOKEN);

    const data = await lxGqlRequest(lxInstance, lxAccessToken, WRITE_USAGE_MUTATION, {
      id: 'e28b5ef4-d9d8-4dc7-9c2f-565610c5c916',
      patches: [
        {
          op: 'replace',
          path: '/lxNumberOfVisitorsLast30Day',
          value: '30'
        },
        {
          op: 'replace',
          path: '/lxLastVisitDate',
          value: '20-12-2021'
        }
      ]
    });

    console.log(data);
  } catch (error) {
    console.log(error);
    process.exit(-1);
  }
})();
