const passport = require("passport");
const FacebookTokenStrategy = require("passport-facebook-token");
const xsenv = require("@sap/xsenv");
const dbClass = require("sap-hdbext-promisfied");
const { v4: uuidv4 } = require("uuid");

let hanaOptions = xsenv.getServices({
	hana: {
		tag: "hana"
	}
});

let fbconfig = require("../config/fbconfig");

passport.use(
	"facebookToken",
	new FacebookTokenStrategy({
			clientID: fbconfig.clientID,
			clientSecret: fbconfig.clientSecret,
		},
		async(accessToken, refreshToken, profile, done) => {
			try {
				console.log("accessToken", accessToken);
				console.log("refreshToken", refreshToken);
				console.log("profile", profile);
				console.log(hanaOptions);

				// Check for user
				// const dbClass = require("../utils/dbPromises");
				let connection = await dbClass.createConnectionFromEnv(dbClass.resolveEnv(hanaOptions));
				let db = new dbClass(connection);

				let sql = `SELECT * FROM "DEMO_USER" WHERE "FBID" = ?`;
				console.log(sql);

				let statement = await db.preparePromisified(sql);

                let results = await db.statementExecPromisified(statement, [profile.id]);
                let id = uuidv4();

				console.log(results);

				if (results[0])
					return done(null, results[0]);

				sql =
					`INSERT INTO "DEMO_USER" ("ID", "FBID", "FIRSTNAME", "LASTNAME", "EMAIL", "PHOTOURL", "ISFACEBOOKUSER") VALUES(?, ?, ?, ?, ?, ?, true)`;
				console.log(sql);

				statement = await db.preparePromisified(sql);

				console.log("id", profile.id);
				console.log("id", profile.name.givenName);
				console.log("id", profile.name.familyName);
                console.log("id", profile.emails[0].value);

                let facebookPhotoUrl = `https://graph.facebook.com/v2.6/${profile.id}/picture?type=large&access_token=${accessToken}`;
                console.log("photo Url", facebookPhotoUrl);

				results = await db.statementExecPromisified(statement, [id, profile.id, profile.name.givenName, profile.name.familyName, profile.emails[
					0].value, facebookPhotoUrl]);

				sql = `SELECT * FROM "DEMO_USER" WHERE "EMAIL" = ?`;
				console.log(sql);

				statement = await db.preparePromisified(sql);

				results = await db.statementExecPromisified(statement, [profile.emails[0].value]);

				console.log(results);

				if (results[0])
					return done(null, results[0]);

			} catch (error) {
				done(error, false, error.message);
			}
		}
	)
);