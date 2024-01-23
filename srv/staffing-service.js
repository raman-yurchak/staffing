
// Import the cds facade object (https://cap.cloud.sap/docs/node.js/cds-facade)
const cds = require('@sap/cds')

// The service implementation with all service handlers
module.exports = cds.service.impl(async function () {

    // Define constants for the Risk and BusinessPartner entities from the risk-service.cds file
    const { BusinessPartners, Opportunities } = this.entities;

    //connect to remote service
    const BusinessPartnerAPI = await cds.connect.to("API_BUSINESS_PARTNER");

    /**
     * Event-handler for read-events on the BusinessPartners entity.
     * Each request to the API Business Hub requires the apikey in the header.
     */
    this.on("READ", BusinessPartners, async (req) => {
        // The API Sandbox returns alot of business partners with empty names.
        // We don't want them in our application
        req.query.where("LastName <> '' and FirstName <> '' ");

        return await BusinessPartnerAPI.transaction(req).send({
            query: req.query,
            headers: {
                apikey: process.env.apikey,
            },
        });
    });


    // Risks?$expand=bp (Expand on BusinessPartner)
    this.on("READ", Opportunities, async (req, next) => {
        /*
         Check whether the request wants an "expand" of the business partner
         As this is not possible, the risk entity and the business partner entity are in different systems (SAP BTP and S/4 HANA Cloud), 
         if there is such an expand, remove it
       */
        if (!req.query.SELECT.columns) return next();

        const expandIndex = req.query.SELECT.columns.findIndex(
            ({ expand, ref }) => {
                return expand && ref[0] === "responsible"
            }
        );

        if (expandIndex < 0) return next();

        // Remove expand from query
        req.query.SELECT.columns.splice(expandIndex, 1);

        // Make sure bp_BusinessPartner (ID) will be returned
        if (!req.query.SELECT.columns.find((column) =>
            column.ref.find((ref) => ref == "responsible_ID")
        )
        ) {
            req.query.SELECT.columns.push({ ref: ["responsible_ID"] });
        }

        const opportunities = await next();

        const asArray = x => Array.isArray(x) ? x : [x];

        // Request all associated BusinessPartners
        const businessPartnerIDs = asArray(opportunities).map(opportunity => opportunity.responsible_ID);
        const businessPartners = await BusinessPartnerAPI.transaction(req).send({
            query: SELECT.from(this.entities.BusinessPartners).where({ ID: businessPartnerIDs }),
            headers: {
                apikey: process.env.apikey,
            }
        });

        // Convert in a map for easier lookup
        const businessPartnerMap = {};
        for (const businessPartner of businessPartners)
            businessPartnerMap[businessPartner.ID] = businessPartner;

        // Add BusinessPartners to result
        for (const opportunity of asArray(opportunities)) {
            opportunity.responsible = businessPartnerMap[opportunity.responsible_ID];
        }

        return opportunities;
    });


});