const fetch = require("node-fetch");
const withQuery = require("with-query").default;
require("dotenv").config();
const express = require("express");
const hbs = require("express-handlebars");
const app = express();
const md5 = require("md5");

app.engine("hbs", hbs({ defaultLayout: "default.hbs" }));
app.set("view engine", "hbs");
app.use(express.static(__dirname + '/static'))

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;
const ts = new Date();
const hash = md5(`${ts}${process.env.private_key}${process.env.apikey}`);
console.log(hash);

app.get("/", (req, res) => {
	fetch(spideyUrl)
		.then((results) => results.json())
		.then((json) => {
			console.log(json.data.results);
			const requiredData = json.data.results.map((c) => {
                const name = c.name
                const id = c.id
                const detailsUrl = c.urls[0].url
                const thumbnail = c.thumbnail.path + "." + c.thumbnail.extension;
                return {name, id, detailsUrl,thumbnail}
			});
		
			if (json.data.count <= 0) {
				return Promise.reject('Not found');
			}

			res.status(200);
			res.type("text/html");
			res.render("index", {
				requiredData
			});
        })
        .catch(e=> console.error('Error', e))
});

const marvelApiUrl = "https://gateway.marvel.com/v1/public/characters";
const spideyUrl = withQuery(marvelApiUrl, {
	apikey: `${process.env.apikey}`,
	hash: hash,
    ts: `${ts}`,
    limit: 50,
    //nameStartsWith: "dr"
});

app.use((req, res) => {
	res.redirect("/");
});
app.listen(PORT, () => {
	console.log(`Marvel PORT ${PORT} is up and running`);
});
