/* eslint-disable-next-line */
const colors = require("colors");
const distance = require("google-distance");
const cds = require("@sap/cds");
const nodemailer = require("nodemailer");

module.exports = srv => {
    /* srv.before("*", req => {
        // console.log("METHOD: ", req.method.yellow.inverse);
        // console.log("TARGET: ", req.target.name.yellow.inverse);
    }); */

    /* srv.on("READ", "Products", async (req, next) => {
        const products = await next();
        return products.filter(product => product.status === "active");
    }); */


    srv.on("sendEmailsToVolunteers", async req => {

        const db = srv.transaction(req);

        let { Users } = srv.entities;
        let results = await db.read(Users, ["id", "firstName", "lastName", "email"]);

        let { host, port, secure, auth} = cds.env.ethereal;

        let subject = "Please refer your friends to Helpful Heroes";
        let body = `Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, 
                    sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est 
                    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et 
                    dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut 
                    labore et dolore magna aliquyam erat`;
        
        let transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth
        });

        results.forEach(result => {
            console.log("Sending email...");
            let info = transporter.sendMail({
                from: "admin@helpfulheroes.com",
                to: result.email,
                subject,
                text: body,
            });
            
        });

        return {
            success: true,
            message: `Campaign emails sent to all users...`
        } 
    });

    srv.on("getTop5ProviderMatches", async req => {

        const { opportunityId } = req.data;
        console.log("Opportunity ID: ", opportunityId);

        const db = srv.transaction(req);

        let { Users, Opportunities, Activities } = srv.entities;

        let results = await db.read(Users, ["id", "firstName", "lastName", "email", "formattedAddress", "latitude", "longitude", "karmaPoints", "category.id as categoryId", "category.name as categoryName"]);
        let activities = await db.read(Activities);
        let opportunities = await db.read(Opportunities, ["id", "category.id as categoryId", "category.name as categoryName", "beneficiary.id as beneficiaryId"]).where({ id: opportunityId });

        let beneficiaryId = opportunities[0].beneficiary.beneficiaryId;
        let category = opportunities[0].category.categoryId;
        let categoryName = opportunities[0].category.categoryName;
        console.log("Beneficiary ID: ", beneficiaryId);
        console.log("Cateogry: ", category);
        console.log("Category ID: ", categoryName);

        let users = results.map(result => {

            return {
                id: result.id,
                name: `${result.firstName} ${result.lastName}`,
                isBenefactor: result.id === beneficiaryId,
                email: result.email,
                address: result.formattedAddress,
                latitude: result.latitude,
                longitude: result.longitude,
                karmaPoints: result.karmaPoints,
                category: result.category.categoryId,
                categoryName: result.category.categoryName
            };

        });

        let benefactors = users.filter(user => user.isBenefactor);
        let benefactor = benefactors[0];
        users = users.filter(user => !user.isBenefactor);

        // console.log("Users: ", users);
        // console.log("Benefactor: ", benefactor);

        let usersAddresses = users.map(user => user.address);
        let googleDistances = await getGoogleDistances(usersAddresses, benefactor.address);
        // console.log("Distances: ", googleDistances);

        let merged = [];

        users.forEach((user, index) => {
            merged.push({
                ...user,
                ...googleDistances[index]
            });
        });

        console.log(merged);


        let rankedUsers = merged.map(user => {
            let distancePoints = 0;
            let karmaPoints = 0;

            let categoryPoints = user.category === category ? 10 : 4;

            if (user.karmaPoints > 2000) {
                karmaPoints = 12;
            } else if (user.karmaPoints > 1500) {
                karmaPoints = 10;
            } else if (user.karmaPoints > 1000) {
                karmaPoints = 7;
            } else {
                karmaPoints = 5;
            }

            let previousRatingPoints = hasHelpedBefore(user, benefactor, activities);

            if (user.duration.replace(" mins", "") < 25) {
                distancePoints = (25 - (user.duration.replace(" mins", "")));
            } else {
                distancePoints = 0;
            }

            let points = distancePoints + previousRatingPoints + karmaPoints + categoryPoints;

            return {
                success: true,
                points,
                distancePoints,
                categoryPoints,
                previousRatingPoints,
                karma: karmaPoints,
                providerId: user.id,
                providerName: user.name,
                email: user.email,
                address: user.address,
                latitude: user.latitude,
                longitude: user.longitude,
                distance: user.distance,
                mode: user.mode,
                duration: user.duration,
                karmaPoints: user.karmaPoints,
                category: user.categoryName
            }

        });

        let top5Providers = rankedUsers.sort((a, b) => b.points - a.points).slice(0, 5);
        console.log("Top 5 Providers: ", top5Providers);
        
        return top5Providers.map((provider, index) => {
            return {ranking: index + 1, ...provider}
        }); 

    });

    srv.on("getDistanceToProvider", async req => {

        const { beneficiaryId } = req.data;
        console.log("Beneficiary ID: ", beneficiaryId);

        const db = srv.transaction(req);

        let { Users } = srv.entities;

        let results = await db.read(Users, ["id", "firstName", "lastName", "formattedAddress", "latitude", "longitude"]);
        console.log("Users: ", results);

        

        let users = results.map(result => {

            return {
                id: result.id,
                name: `${result.firstName} ${result.lastName}`,
                isBenefactor: result.id === beneficiaryId,
                address: result.formattedAddress,
                latitude: result.latitude,
                longitude: result.longitude
            };

        });

        console.log("Users: ", users);

        let benefactors = users.filter(user => user.isBenefactor);
        users = users.filter(user => !user.isBenefactor);
        console.log("Benefactors: ", benefactors);

        

        let usersAddresses = users.map(user => user.address);

        console.log("User Addresses: ", usersAddresses);
        console.log("Benefactor Address: ", benefactors[0].address);

        let googleDistances = await getGoogleDistances(usersAddresses, benefactors[0].address);
        console.log("Distances: ", googleDistances);

        let merged = [];


        users.forEach((user, index) => {
            merged.push({
                ...user,
                ...googleDistances[index]
            });
        });

        console.log(merged);


        return merged.map(row => {
            return {
                success: true,
                providerId: row.id,
                providerName: row.name,
                address: row.address,
                distance: row.distance,
                mode: row.mode,
                duration: row.duration
            }
        });



    });

    const hasHelpedBefore = (user, benefactor, activities) => {

        let fiveStarCount = 0;
        let fourStarCount = 0;
        let threeStarCount = 0;
        let oneStarCount = 0;

        activities.forEach(activity => {
            if (activity.provider_id === user.id && activity.benefactor_id === benefactor.id && activity.rating === 5) {
                fiveStarCount += 1;
            } else if (activity.provider_id === user.id && activity.benefactor_id === benefactor.id && activity.rating === 4) {
                fourStarCount += 1;
            } else if (activity.provider_id === user.id && activity.benefactor_id === benefactor.id && activity.rating === 3) {
                threeStarCount += 1;
            }  else if (activity.provider_id === user.id && activity.benefactor_id === benefactor.id && activity.rating === 1) {
                oneStarCount += 1;
            }
        });

        return fiveStarCount * 12 + fourStarCount * 7 + threeStarCount * 4 - oneStarCount * 15;
    }

    const getGoogleDistances = (usersAddresses, benefactorAddress) => {

        console.log("User Addresses: ", usersAddresses);
        console.log("Benefactor Address: ", benefactorAddress);

        distance.apiKey = "AIzaSyAPtG0xoIaMzHOZJxeBV_ZY4dvtKWZ8j-k";

        return new Promise((resolve, reject) => {
            distance.get({
                origins: usersAddresses,
                destinations: [benefactorAddress]

            }, function (err, data) {

                console.log("Entering callback...");
                return err ? reject(err) : resolve(data);
            });
        });

    }

}