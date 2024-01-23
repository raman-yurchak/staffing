namespace staffing;

using {API_BUSINESS_PARTNER as BusinessPartner} from '../srv/external/API_BUSINESS_PARTNER.csn';
using {
        managed,
        cuid
} from '@sap/cds/common';

entity Opportunities : cuid, managed {
        position        : String(100);
        responsible : Association to BusinessPartners;
}

/*entity Applications {

}*/

entity BusinessPartners as
        projection on BusinessPartner.A_BusinessPartner {
                key BusinessPartner         as ID,
                    BusinessPartnerFullName as FullName,
        }
