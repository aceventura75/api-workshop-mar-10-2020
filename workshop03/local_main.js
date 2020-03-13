const { join } = require('path');
const fs = require('fs');

//load library
const preconditions=require('express-preconditions')
const cors = require('cors');
const range = require('express-range')
const compression = require('compression')

const { Validator, ValidationError } = require('express-json-validator-middleware')
const OpenAPIValidator = require('express-openapi-validator').OpenApiValidator;

const schemaValidator = new Validator({ allErrors: true, verbose: true });

const express = require('express')

const data = require('./zips')
const CitiesDB = require('./zipsdb')

//Load application keys
const db = CitiesDB(data);

const app = express();

//disable xpress etag

app.set ('etag', false)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start of workshop

//1/2 Load schemas
new OpenAPIValidator({
    apiSpec: join(__dirname, 'schema', 'zips.yaml')
}).install(app)
    .then(() => {
        //Ok we can proceed with rest of our app
        // Mandatory workshop
        // TODO GET /api/states
        app.get('/api/states',
            (req, resp) => { //handler
                count++
                console.info('in GET /api/state',count)
                const result = db.findAllStates()
                //status code
                resp.status(200)
                //set header,public,age=5 min
                resp.set('cache-control',"public,max-age=300")
                //set content-type
                resp.type('application/json')
                resp.set('X-genereated-on', (new Date()).toDateString())
                resp.json(result)

            }
        )


//calulate etag

const options={
    stateAsync:(req)=>{
        const state= req.params.state
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        return Promise.resolve({
            //"CA_0_10"
            etag: '"${state}_${offset}_${limit}"'
        })
    }
}
   
   
        // TODO GET /api/state/:state
        app.get('/api/state/:state',
            preconditions(options),
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
                //etag
                resp.set("etag", '"${state}_${offset}_${limit}"')
                resp.json(result)

            }
        )
        //TODO DELETE /api/city/:name
        // TODO GET /api/city/:cityId

        // TODO POST /api/city
        //Content-type:application/x-www-from-urlencoded
        app.post('/api/city',
            (req, resp) => {
                const body = req.body;
                console.info('body', body)
           
                // if (!db.validateForm(body)) {
                //     resp.status(400)
                //     resp.type('application/json')
                //     resp.json({ 'message': 'incomplete form' })
                //     return
                // }

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
        app.use('/schema', express.static(join(__dirname, 'schema')));

        app.use((error, req, resp, next) => {

            if (error instanceof ValidationError) {
                console.error('Schema validation error: ', error)
                return resp.status(400).type('application/json').json({ error: error });
            }

            else if (error.status) {
                console.error('OpenAPI specification error: ', error)
                return resp.status(400).type('application/json').json({ error: error });
            }

            console.error('Error: ', error);
            resp.status(400).type('application/json').json({ error: error });
        })
        const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000;
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)
        })

    })
    .catch(error => {
        console.error('error', error)
    })
// TODO 1/2 Load schemans


// Start of workshop
// TODO 2/2 Copy your routes from workshop02 here

// End of workshop


