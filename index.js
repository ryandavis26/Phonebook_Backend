//Use Express Server and Express Server JSON rendering
const express = require('express')
const app = express()
require('dotenv').config()
app.use(express.json())
app.use(express.static('dist'))

const Person = require('./models/person')

let persons = [

]


//Use the Morgan Logging Library
const morgan = require('morgan')
app.use(morgan('tiny'))

const logResponseBody = (req, res, next) => {
  // Only apply to POST requests
  if (req.method === 'POST') {
    const originalSend = res.send;

    let responseBody;

    // Override the send method by capturing the body before invoking the orignal send method with its original context
    res.send = function(body) {
      responseBody = body; // Capture the response body
      originalSend.apply(res, arguments); // Invoke the original send method with the old this context
    };

    // Use the 'finish' event to log the response body after the response is sent
    res.on('finish', () => {
      console.log(`Response Body for ${req.method} ${req.url}: ${responseBody}`);
    });
  }
  next();
};


//Use the Cross Origin Resource Sharing Library to allow Localhost:5173 to talk to Localhost:3001
const cors = require('cors')
const person = require('./models/person')
app.use(cors())

app.use(logResponseBody);
//
//Sends and error whent the API recieves a request to an unknown url endpoint
//Must be declared afte the requests are made
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
//Middleware to handle arrors when attempting to look up or delete persons that do not exists
const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  //Handle the error if you submit an invalid id to the api, which mongo can't cast into a valid id
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformed id' })
  }
  //Handle the error if you try to pass an invalid type of length to name/number
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })

  }
  next(error)
}
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

app.get('/info', (request, response) => {

  const todayDate = new Date(Date.now())
  Person.countDocuments().then(personCount => {
    response.send(`<h1> The database has ${personCount} of people in it</h1>
    <h2>The current time is ${todayDate.toDateString()}<h2>`)
  })

})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))

})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body === undefined) {
    return response.status(404).send({ error: 'body of request is undefined: content missing' })
  }

  //if (body.name === undefined || body.number === undefined) {
  //  return response.status(400).send({ error: 'error in handling body of request: name or number misssing' })
  //}


  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
