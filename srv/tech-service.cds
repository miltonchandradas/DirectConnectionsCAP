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
        service.description as serviceDescription,
        opportunity.description as opportunityDescription,
        provider.firstName as providerFirstName,
        provider.lastName as providerLastName,
        beneficiary.firstName as beneficiaryFirstName,
        beneficiary.lastName as beneficiaryLastName
    };

    entity CodeOfConduct as Select from demo.CodeOfConduct;

    type distanceResult {
        success: Boolean;
        providerId: String;
        providerName: String;
        address: String;
        distance: String;
        mode: String;
        duration: String;
    }

    type providersResult {
        success: Boolean;
        ranking: Integer;
        points: Integer;
        categoryPoints: Integer;
        distancePoints: Integer;
        previousRatingPoints: Integer;
        karma: Integer;
        providerId: String;
        providerName: String;
        email: String;
        address: String;
        latitude: Decimal(12, 9);
        longitude: Decimal(12, 9);
        distance: String;
        mode: String;
        duration: String;
        karmaPoints: Integer;
        category: String;
    }

    function getDistanceToProvider(beneficiaryId: String) returns array of distanceResult;

    function getTop5ProviderMatches(beneficiaryId: String) returns array of providersResult;

};