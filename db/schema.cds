
namespace demo;
type Address {
    street : String(100);
    city   : String(20);
    state  : String(10);
    zip    : String(10);
}

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
