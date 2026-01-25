import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personsService from './services/persons'
import Notification from './components/Notification'
import './index.css'

const App = () => {
    const [persons, setPersons] = useState([])

    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [newFilter, setFilter] = useState('')
    const [showFilter, setShowFilter] = useState(true)
    const [newNotification, setNotification] = useState(null)

    useEffect(() => {
        personsService
            .getAll()
            .then(response => {
                setPersons(response.data)
            })
    }, [])

    const deleteFunc = (id, name) => {
        if (window.confirm(`Delete ${name}?`)) {
            personsService
                .deletePerson(id)
                .then(() => {
                    setPersons(persons.filter(person => person.id !== id))
                })
            setNotification(`${name} has been deleted`)
            setTimeout(() => {
                setNotification(null)
            }, 4000)
        }
    }

    const addPerson = (event) => {
        event.preventDefault()
        if (persons.some(person => person.name === newName)) {
            const existingPerson = persons.find(p => p.name === newName)
            if (window.confirm(`${newName} is already added to the phonebook, replace the old number with a new one?`)) {
                const updatedPerson = {
                    ...existingPerson,
                    number: newNumber
                }
                personsService
                    .update(existingPerson.id, updatedPerson)
                    .then(response => {
                        setPersons(persons.map(person => (
                            person.id !== existingPerson.id ? person : response.data
                        )))
                        setNotification(`${updatedPerson.name}'s number has been changed`)
                        setTimeout(() => {
                            setNotification(null)
                        }, 4000)
                    })
                    .catch(error => {
                        setNotification(`Information of ${updatedPerson.name} has already been removed from the server`)
                        setTimeout(() => {
                            setNotification(null)
                        }, 4000)
                        setPersons(persons.filter(person => person.id !== updatedPerson.id))
                    })
            }
        } else {
            const person = {
                name: newName,
                number: newNumber
            }
            personsService
                .create(person)
                .then(response => {
                    setPersons(persons.concat(response.data))
                    setNotification(`Added ${person.name}`)
                    setTimeout(() => {
                        setNotification(null)
                    }, 4000)
                })
                .catch(error => {
                    setNotification(error.response.data.error)
                    setTimeout(() => {
                        setNotification(null)
                    }, 4000)
                })
        }
        setNewName('')
        setNewNumber('')
    }

    const handleNameChange = (event) => {
        setNewName(event.target.value)
    }

    const handleNumberChange = (event) => {
        setNewNumber(event.target.value)
    }

    const handleFilterChange = (event) => {
        setFilter(event.target.value)
        setShowFilter(event.target.value === '')
    }

    const showFilteredPeople = showFilter
        ? persons
        : persons.filter(person =>
            person.name.toLowerCase().includes(newFilter.toLowerCase())
        );

    return (
        <div>
            <h2>Phonebook</h2>
            <Notification message={newNotification} />
            <Filter value={newFilter} onChange={handleFilterChange} />
            <h2>add a new</h2>
            <PersonForm onSubmit={addPerson} name={newName} number={newNumber} nameChange={handleNameChange} numberChange={handleNumberChange} />
            <h2>Numbers</h2>
            <Persons persons={showFilteredPeople} onDelete={deleteFunc} />
        </div>
    )
}

export default App
