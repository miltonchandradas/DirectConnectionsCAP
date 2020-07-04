using {demo} from '../db/schema';

service TechService {
    entity Products as select from demo.Products {*,
        supplier.name as supplierName, supplier.contactName as supplierContact
    };
    entity Suppliers as select from demo.Suppliers;

    entity Categories as select from demo.Category;

    entity Opportunities as select from demo.Opportunity; 

};