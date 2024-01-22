namespace staffing;

using { API_BUSINESS_PARTNER as BusinessPartner } from '../srv/external/API_BUSINESS_PARTNER.csn';
using {
        managed,
        cuid
} from '@sap/cds/common';

entity Opportunities: cuid, managed {
  
}

entity Applications {
  
}

entity BusinessPartners as projection on BusinessPartner.A_BusinessPartner {
   key BusinessPartner,
   BusinessPartnerFullName as FullName,
}
