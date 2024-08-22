
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))


const cors = require('cors')
app.use(cors())

const morgan = require('morgan')
app.use(morgan('tiny'))

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

/*
 * TODO Research a better way to randomly generate an ID that is not just randomly assign with potential collisions 
 */
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

  persons.forEach(person => {
    if (body.name === person.name)
      return response.status(400).json({
        error: 'Can\'t add duplicate names to the Phonebook'
      })
  });

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }
  persons = persons.concat(person)
  response.json(persons)
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
