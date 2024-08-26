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
app.use(cors())


app.use(logResponseBody);


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////





const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}



app.get('/info', (request, response) => {
  let personsLength = persons.length
  let curTime = new Date()
  return response.send(
    `<p>Phonebook has info for ${personsLength} people </p>` + `<p> ${curTime}</p>`
  )
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })

})


const generateId = () => {
  return Math.ceil(Math.random() * 10000)
}

app.post('/api/persons', (request, response) => {
  const body = request.body


  if (body === undefined) {

    return response.status(404).send({ error: 'body of request is undefined: content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
