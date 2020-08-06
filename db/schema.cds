namespace demo;

type Address {
    street : String(100);
    city   : String(20);
    state  : String(10);
    zip    : String(10);
}

type mediumString50 : String(50);
type longString100 : String(100);
type veryLongString1000 : String(1000);
type sDate : DateTime;
type fourdigitDecimal : Decimal(15, 4);


entity User {
    key id                  : mediumString50;
        firstName           : mediumString50 not null;
        lastName            : mediumString50 not null;
        email               : mediumString50 not null;
        password            : longString100 not null default 'nopassword';
        isFacebookUser      : Boolean default false;
        fbId                : mediumString50;
        isAdmin             : Boolean default false;
        photoUrl            : longString100;
        karmaPoints         : Integer default 100;
        formattedAddress    : longString100;
        latitude            : Decimal(12, 9);
        longitude           : Decimal(12, 9);
        coordinates         : hana.ST_POINT(4326) null;
        isochrone5mCar      : hana.ST_GEOMETRY(4326) null;
        opportunity         : Association to many Opportunity
                                  on opportunity.beneficiary = $self;
        category            : Association to Category;
        activityProvider    : Association to many Activity
                                  on activityProvider.provider = $self;
        activityBeneficiary : Association to many Activity
                                  on activityBeneficiary.beneficiary = $self;
        serviceProvider     : Association to many Service
                                  on serviceProvider.provider = $self;

}


entity Category {
    key id          : Integer;
        name        : longString100;
        description : veryLongString1000;
        user        : Association to many User
                          on user.category = $self;
        opportunity : Association to many Opportunity
                          on opportunity.category = $self;
        service     : Association to many Service
                          on service.category = $self;

}


entity Opportunity {
    key id                 : mediumString50;
        description        : veryLongString1000 not null;
        state              : mediumString50 default 'pending';
        startDate          : sDate;
        endDate            : sDate;
        estimatedHours     : Integer;
        additionalComments : veryLongString1000;
        difficultyLevel    : Integer default 2;
        beneficiary        : Association to User;
        activity           : Association to Activity;
        category           : Association to Category;

}

entity Service {
    key id                 : mediumString50;
        description        : veryLongString1000 not null;
        state              : mediumString50 default 'pending';
        startDate: sDate;
        endDate: sDate;
        estimatedHours     : Integer;
        additionalComments : veryLongString1000;
        difficultyLevel    : Integer default 2;
        provider           : Association to User;
        activity           : Association to Activity;
        category           : Association to Category;
}


entity Activity {
    key id           : mediumString50;
        activityDate : sDate;
        initiatedBy  : mediumString50 default 'volunteer';
        state        : mediumString50 default 'subscribed';
        isComplete   : Boolean default false;
        rating       : Integer default null;
        provider     : Association to User;
        beneficiary  : Association to User;
        opportunity  : Association to Opportunity;
        service      : Association to Service;
}

entity CodeOfConduct {
    key id   : Integer;
        body : veryLongString1000;
}
