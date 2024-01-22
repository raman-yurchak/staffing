using staffing from '../db/schema';

service StaffingService {
    @readonly
    entity Opportunities    as projection on staffing.Opportunities;

    @readonly
    entity BusinessPartners as projection on staffing.BusinessPartners;
}
