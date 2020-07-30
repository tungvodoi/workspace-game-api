module.exports = /* GraphQL */ `
  type googleAnalytics {
    trackingId: String
    viewId: String
    isActive: Boolean
  }
  type PageGa {
    pageviews: Int
    users: Int
    newUsers: Int
    sessions: Int
    avgSessionDuration: String
    bounceRate: Int
  }
  type getGaTrafficByDay {
    day: String
    numberOfUser: Int
  }
  type Campaign {
    _id: String
    name: String
    email: String
    googleAnalytics: googleAnalytics
    createdAt: String
    expiredAt: String
    workspaceName: String
  }
  type Pagination {
    listCampaign: [Campaign]
    totalCampaign: Int
  }
  type ReportEvent{
    totalsForAllResults: Int
    events: [[String]]
  }
  type Query {
    getListCampaign(page: Int, query: String): Pagination
    getReports(campaignId: String): ReportEvent
    getGaTraffic(campaignId: String): PageGa
    getGaTrafficByDay(campaignId: String): [getGaTrafficByDay]
  }
  type Mutation {
    createCampaign(
      name: String
      email: String
      createdAt: String
      expiredAt: String
    ): Campaign
    enableTracking(campaignId: String, campaignName: String): String
  }
`;
