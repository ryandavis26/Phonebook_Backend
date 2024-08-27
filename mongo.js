const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

//Connect to the DB using given password
const password = process.argv[2]
const url =
  `mongodb+srv://ryandavisim:${password}@cluster0.495ag.mongodb.net/Phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)


mongoose.connect(url).then(() => {
  const personSchema = new mongoose.Schema({
    name: String,
    number: String
  })

  //Define What it means to be a person
  const Person = mongoose.model('Person', personSchema)

  //Return all notes from the database
  const getAllNotes = Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })



  //IF the given system arguments doesn't include a name and number then print all the person
  //Otherwise add the person to the database using the given name and number
  if (process.argv.length < 5) {
    console.log('Phonebook')
    getAllNotes
  } else {
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4]
    })

    person.save().then(result => {
      console.log(`person ${person.name} ${person.number}`)
      mongoose.connection.close()
    })
  }

})




