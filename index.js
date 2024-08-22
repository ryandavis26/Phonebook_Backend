//Use Express Server and Express Server JSON rendering
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))


//Use the Cross Origin Resource Sharing Library to allow Localhost:5173 to talk to Localhost:3001
const cors = require('cors')
app.use(cors())


//Use the Morgan Logging Library
const morgan = require('morgan')
app.use(morgan('tiny'))

const logResponseBody = (req, res, next) => {
  // Only apply to POST requests
  if (req.method === 'POST') {
    const originalSend = res.send;

    let responseBody;

    // Override the send method by capturing the body before invoking the orignal send method with its original context
    res.send = function (body) {
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

app.use(logResponseBody);


let persons = [
  {
    "id": "1",
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": "2",
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": "3",
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": "4",
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/info', (request, response) => {
  let personsLength = persons.length
  let curTime = new Date()
  return response.send(
    `<p>Phonebook has info for ${personsLength} people </p>` + `<p> ${curTime}</p>`
  )
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const curPerson = persons.find(person => person.id == id)

  if (curPerson) {
    response.json(curPerson)
  } else {
    response.status(404).end()
  }

})


const generateId = () => {
  return Math.ceil(Math.random() * 10000)
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  
  for (const person of persons) {
    if(body.name === person.name){
      return response.status(400).json({
        error: 'Can\'t add duplicate names to the Phonebook'
      })
    }
  }

  const person = {
    id: generateId().toString(),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(person)
  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})


const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
