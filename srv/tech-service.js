/* eslint-disable-next-line */
const colors = require("colors");
const distance = require("google-distance");

module.exports = srv => {
    /* srv.before("*", req => {
        // console.log("METHOD: ", req.method.yellow.inverse);
        // console.log("TARGET: ", req.target.name.yellow.inverse);
    }); */

    /* srv.on("READ", "Products", async (req, next) => {
        const products = await next();
        return products.filter(product => product.status === "active");
    }); */


    srv.on("getTop5ProviderMatches", async req => {

        const { beneficiaryId } = req.data;
        // console.log("Beneficiary ID: ", beneficiaryId);

        const db = srv.transaction(req);

        let { Users, Activities } = srv.entities;

        let results = await db.read(Users, ["id", "firstName", "lastName", "email", "formattedAddress", "latitude", "longitude", "karmaPoints", "category.id as categoryId", "category.name as categoryName"]);
        let activities = await db.read(Activities);

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

            let categoryPoints = user.category === benefactor.category ? 10 : 3;

            if (user.karmaPoints > 3000) {
                karmaPoints = 25;
            } else if (user.karmaPoints > 2500) {
                karmaPoints = 20;
            } else if (user.karmaPoints > 2000) {
                karmaPoints = 15;
            } else if (user.karmaPoints > 1500) {
                karmaPoints = 10;
            } else if (user.karmaPoints > 1000) {
                karmaPoints = 5;
            } else {
                karmaPoints = 3;
            }

            let previousRatingPoints = hasHelpedBefore(user, benefactor, activities);

            if (user.duration.replace(" mins", "") < 5) {
                distancePoints = 25;
            } else if (user.duration.replace(" mins", "") < 10) {
                distancePoints = 20;
            } else if (user.duration.replace(" mins", "") < 15) {
                distancePoints = 15;
            } else if (user.duration.replace(" mins", "") < 20) {
                distancePoints = 10;
            } else if (user.duration.replace(" mins", "") < 25) {
                distancePoints = 5;
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

        distance.apiKey = "AIzaSyD74q4uKq-APn2fCWG6KJCrsy7UPWvtf9E";

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