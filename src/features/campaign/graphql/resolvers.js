const campaignServices = require("../campaign.service");

module.exports = {
  Query: {
    getListCampaign: async (_, { page, query }) => {
      return await campaignServices.getListCampaign(page, query);
    },
    // getReports: (_, { campaignId }) => {
    //   return campaignServices.getReports(campaignId);
    // },
    getGaTraffic: async (_, { campaignId }) => {
      return await campaignServices.getGaTraffic(campaignId);
    },
    getGaTrafficByDay: async (_, { campaignId, startDate, endDate }) => {
      return await campaignServices.getGaTrafficByDay(
        campaignId,
        startDate,
        endDate
      );
    },
    getSources: async (_, { campaignId }) => {
      return await campaignServices.getSources(campaignId);
    },
  },
  Mutation: {
    createCampaign: async (_, { name, email, createdAt, expiredAt }) => {
      return await campaignServices.createCampaign(
        name,
        email,
        createdAt,
        expiredAt
      );
    },
    enableTracking: (_, { campaignId, campaignName }) =>
      campaignServices.enableTracking(campaignId, campaignName),
    deleteCampaign: (_, { campaignId }) =>
      campaignServices.deleteCampaign(campaignId),
  },
};
