using {demo} from '../db/schema';

service TechService {
    
    entity Users as select from demo.User {*} excluding { coordinates, isochrone5mCar };

    entity Categories as select from demo.Category;

    entity Opportunities as select from demo.Opportunity {*,
        beneficiary.firstName as beneficiaryFirstName,
        beneficiary.lastName as beneficiaryLastName,
        category.name as categoryName
    }; 

    entity Services as Select from demo.Service {*,
        provider.firstName as providerFirstName,
        provider.lastName as providerLastName,
        category.name as categoryName
    };

    entity Activities as Select from demo.Activity {*,
        provider.firstName as providerFirstName,
        provider.lastName as providerLastName,
        beneficiary.firstName as beneficiaryFirstName,
        beneficiary.lastName as beneficiaryLastName
    };

};