const CampaignModel = require("../models/campaign");
const WorkspaceModel = require("../models/workspace");
const escapeRegex = require("../utils/regex-escape");
const GA = require("../utils/googleAnalytics");
const util = require("util");
const _ = require("lodash");

module.exports = {
  createCampaign: async (name, email, createdAt, expiredAt) => {
    const campaign = await CampaignModel.create({
      name,
      email,
      createdAt,
      expiredAt,
    });
    const workspace = await WorkspaceModel.findOne({ email: email }).lean();
    campaign.workspaceName = workspace.name;
    return campaign;
  },

  getListCampaign: async (page = 1, query) => {
    const pageSize = 3;
    page = page > 0 ? page : 1;
    let listCampaign, totalCampaign;

    let searchName = {};
    if (query) {
      name = new RegExp(escapeRegex(query), "gi");
      searchName = {
        name: name,
      };
    }
    listCampaign = await CampaignModel.find(searchName)
      .sort({ createdAt: -1 })
      .skip(pageSize * page - pageSize)
      .limit(pageSize)
      .lean();
    await Promise.all(
      listCampaign.map(async (campaign) => {
        const workspace = await WorkspaceModel.findOne({
          email: campaign.email,
        }).lean();
        if (workspace) {
          if (campaign.email === workspace.email) {
            campaign.workspaceName = workspace.name;
          }
        }
      })
    );
    totalCampaign = await CampaignModel.countDocuments(searchName);
    return { listCampaign, totalCampaign };
  },

  enableTracking: async (campaignId, campaignName) => {
    const trackingId = await GA.analytics().management.webproperties.insert({
      accountId: "158530582",
      resource: {
        name: campaignName,
      },
    });
    const view = await GA.analytics().management.profiles.insert({
      accountId: "158530582",
      webPropertyId: trackingId.data.id,
      resource: {
        name: campaignName,
      },
    });
    console.log(view.data.id);
    await CampaignModel.findOneAndUpdate(
      { _id: campaignId },
      {
        $set: {
          "googleAnalytics.trackingId": trackingId.data.id,
          "googleAnalytics.viewId": view.data.id,
        },
      }
    );
    return trackingId.data.id;
  },
  getReports: async (campaignId) => {
    const campaign = await CampaignModel.findById(campaignId).lean();
    const reports = await GA.analytics().data.realtime.get({
      ids: `ga:${campaign.googleAnalytics.viewId}`,
      metrics: "rt:totalEvents",
      dimensions: "rt:eventAction,rt:eventCategory,rt:eventLabel",
    });
    console.log(reports.data);
    return {
      totalsForAllResults: reports.data.totalsForAllResults["rt:totalEvents"]
        ? reports.data.totalsForAllResults["rt:totalEvents"]
        : [],
      events: reports.data.rows,
    };
  },
  getGaTraffic: async (campaignId) => {
    const campaign = await CampaignModel.findById(campaignId).lean();
    const reports = await GA.analyticsReporting().reports.batchGet({
      requestBody: {
        reportRequests: [
          {
            viewId: campaign.googleAnalytics.viewId,
            dateRanges: [
              {
                startDate: "2020-07-27",
                endDate: "2020-07-30",
              },
            ],
            metrics: [
              { expression: "ga:pageviews" },
              { expression: "ga:users" },
              { expression: "ga:newUsers" },
              { expression: "ga:sessions" },
              { expression: "ga:avgSessionDuration" },
              { expression: "ga:bounceRate" },
            ],
            // dimensions: [{ name: "ga:sessions" }],
          },
        ],
      },
    });
    // console.log(util.inspect(reports, false, null, true /* enable colors */));
    let data;
    reports.data.reports[0].data.rows.map((row) => {
      data = _.zipObject(
        [
          "pageviews",
          "users",
          "newUsers",
          "sessions",
          "avgSessionDuration",
          "bounceRate",
        ],
        [
          // ...row.dimensions.map((dimension) => dimension),
          ..._.flattenDeep(row.metrics.map((metric) => metric.values)),
        ]
      );
    });
    console.log(data);
    return data;
  },
  getGaTrafficByDay: async (campaignId, fromDate, toDate) => {
    const campaign = await CampaignModel.findById(campaignId).lean();
    const reports = await GA.analyticsReporting().reports.batchGet({
      requestBody: {
        reportRequests: [
          {
            viewId: campaign.googleAnalytics.viewId,
            dateRanges: [
              {
                startDate: "2020-07-27",
                endDate: "2020-07-30",
              },
            ],
            metrics: [{ expression: "ga:30dayUsers" }],
            dimensions: [{ name: "ga:date" }],
          },
        ],
      },
    });
    const data = [];
    reports.data.reports[0].data.rows.map((row) => {
      data.push(
        _.zipObject(
          ["date", "numberOfUser"],
          [
            ...row.dimensions.map((dimension) => dimension),
            ..._.flattenDeep(row.metrics.map((metric) => metric.values)),
          ]
        )
      );
    });
    console.log(data);
    return data;
  },
  deleteCampaign: async (campaignId) => {},

  // enableTracking: async (campaignId) => {
  //   const campaign = await CampaignModel.findById({ _id: campaignId }).lean();
  //   console.log(!campaign.googleAnalytics.trackingId);
  //   if (campaign && !campaign.googleAnalytics.trackingId) {
  //     const view = await analytics().management.profiles.insert({
  //       accountId: "158530582",
  //       webPropertyId: campaign.googleAnalytics.trackingId,
  //       resource: {
  //         name: campaign.name,
  //       },
  //     });
  //     console.log(view);
  //     return true;
  //   }
  // },
};
