const Persons = ({ persons, onDelete }) => {
    return (
        <>
            {persons.map((person, i) =>
                <div key={i}>
                    {person.name} {person.number} 
                    <button onClick={() => onDelete(person.id, person.name)}>
                        delete
                    </button>
                </div>
            )}
        </>
    )
}

export default Persons