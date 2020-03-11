const range = require('express-range')
const compression = require('compression')

const express = require('express')

const data = require('./zips')
const CitiesDB = require('./zipsdb')

//Load application keys
const db = CitiesDB(data);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start of workshop

// Mandatory workshop
// TODO GET /api/states
app.get('/api/states',
	(req, resp) => { //handler
		const result = db.findAllStates()
		//status code
		resp.status(200)
		//set content-type
		resp.type('application/json')
		resp.set('X-genereated-on', (new Date()).toDateString())
		resp.json(result)

	}
)

// TODO GET /api/state/:state
app.get('/api/states/:state',
	(req, resp) => { //handler
		//Read the value from  the route:state
		const state = req.params.state
		//Read the query string
		const limit = parseInt(req.query.limit) || 10;
		const offset = parseInt(req.query.offset) || 0;

		//10 result from the top
		const result = db.findCitiesByState(state,
			{ offset: offset, limit: limit })
		//status code
		resp.status(200)
		//set content-type
		resp.type('application/json')
		resp.json(result)

	}
)
//TODO DELETE /api/city/:name
// TODO GET /api/city/:cityId

// TODO POST /api/city
//Content-type:application/x-www-from-urlencoded
app.post('/api/city',
	(req, resp) => {
		const boday = req.body;
		console.info('body', body)
		if (!db.validateForm(body)) {
			resp.status(400)
			resp.type('application/json')
			resp.json({ 'message': 'incomplete form' })
			return
		}

		//insert db
		//TODO loc = "number,number" => [ number, number ]
		db.insertCity(body)
		resp.status(201)
		resp.type('application/json')
		resp.json({ 'message': 'created' })
	}
)

// Optional workshop
// TODO HEAD /api/state/:state
// IMPORTANT: HEAD must be place before GET for the
// same resource. Otherwise the GET handler will be invoked


// TODO GET /state/:state/count
app.get('/api/states/:state/count',
	(req, resp) => { //handler
		const state = req.params.state
		const count = db.countCitiesInState(state)
		const result = {
			state: state,
			numOfCities: count,
			timestamp: (new Date()).toDateString()
		}

		//status code
		resp.status(200)
		//set content-type
		resp.type('application/json')
		resp.json(result)

	}
)

// TODO GET /api/city/:name


// End of workshop

const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000;
app.listen(PORT, () => {
	console.info(`Application started on port ${PORT} at ${new Date()}`);
});

