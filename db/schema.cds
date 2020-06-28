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

entity Products {
    key id          : Integer;
        name        : String(100);
        description : String(1000);
        category    : String(100);
        stock       : Integer;
        price       : Decimal(6, 2);
        discount    : Decimal(3, 2);
        status      : String(100);
        supplier    : Association to Suppliers;
}

entity Suppliers {
    key id          : Integer;
        name        : String(100);
        contactName : String(100);
        address     : Address;
        products    : Association to many Products
                          on products.supplier = $self;
}


entity User {
    key id               : String(50);
        firstName        : mediumString50 not null;
        lastName         : mediumString50 not null;
        email            : mediumString50 not null;
        password         : longString100  not null default 'nopassword';
        isFacebookUser   : Boolean        default false;
        fbId             : mediumString50;
        isAdmin          : Boolean        default false;
        photoUrl         : longString100;
        categoryId       : Integer;
        karmaPoints      : Integer        default 100;
        formattedAddress : longString100;
        coordinates      : hana.ST_POINT(4326) null;
        isochrone5mCar   : hana.ST_GEOMETRY(4326) null;
}






