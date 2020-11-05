const fetch = require("node-fetch");
const withQuery = require("with-query").default;
require("dotenv").config();
const express = require("express");
const hbs = require("express-handlebars");
const app = express();
const md5 = require("md5");
const e = require("express");

app.engine("hbs", hbs({ defaultLayout: "default.hbs" }));
app.set("view engine", "hbs");
app.use(express.static(__dirname + "/static"));

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;
const ts = new Date();
const hash = md5(`${ts}${process.env.private_key}${process.env.apikey}`);
console.log(hash);

const cachedData = [];
const cachedAlpha = [];
app.get(
	"/:x",
	(req, res, next) => {
		console.log(cachedAlpha);
		if ((cachedAlpha.length = 0)) {
			next();
		} else {
			const matched = (n) => (n = req.params.x);
			const index = cachedAlpha.findIndex(matched);

			const savedData = cachedData[index];
			if (savedData) {
				res.status(200);
				res.type("text/html");
				res.render("index", {
					requiredData: savedData,
				});

				console.log("no fetching");
				res.end();
			} else next();
		}
	},
	async (req, res) => {
		const marvelNameStartsWithUrl = withQuery(marvelApiUrl, {
			apikey: `${process.env.apikey}`,
			hash: hash,
			ts: `${ts}`,
			limit: 5,
			nameStartsWith: req.params.x,
		});
		console.log("fetching");
		try {
			const results = await fetch(marvelNameStartsWithUrl);
			const jsonData = await results.json();
			const requiredData = formatData(jsonData.data.results);
			if (jsonData.data.count <= 0) {
				res.status(400);
				res.type("text/html");
				res.render("index", {
					notFound: true,
				});
				return Promise.reject("Not found");
			}

			cachedData.push(requiredData);
			cachedAlpha.push(req.params.x);
			console.log(cachedAlpha);
			res.status(200);
			res.type("text/html");
			res.render("index", {
				requiredData,
				alphabet,
			});
		} catch (e) {
			console.log(e);
		}
	}
);

const formatData = (fetchedData) => {
	return fetchedData.map((c) => {
		const name = c.name;
		const id = c.id;
		const detailsUrl = c.urls[0].url;
		const thumbnail = c.thumbnail.path + "." + c.thumbnail.extension;
		return { name, id, detailsUrl, thumbnail };
	});
};
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVXYZ".split("");
app.get("/", (req, res) => {
	const cachedValue = [];
	fetch(marvelUrl)
		.then((results) => results.json())
		.then((json) => {
			const requiredData = formatData(json.data.results);
			console.log(requiredData);
			if (json.data.count <= 0) {
				return Promise.reject("Not found");
			}

			res.status(200);
			res.type("text/html");
			res.render("index", {
				requiredData,
				alphabet,
				cachedValue: JSON.stringify(cachedValue),
			});
		})
		.catch((e) => console.error("Error", e));
});

const marvelApiUrl = "https://gateway.marvel.com/v1/public/characters";

const marvelUrl = withQuery(marvelApiUrl, {
	apikey: `${process.env.apikey}`,
	hash: hash,
	ts: `${ts}`,
	limit: 5,
});

app.use((req, res) => {
	res.redirect("/");
});
app.listen(PORT, () => {
	console.log(`Marvel PORT ${PORT} is up and running`);
});
