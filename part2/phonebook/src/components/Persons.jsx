const Persons = ({ persons }) => {
    return (
        <>
            {persons.map((person, i) =>
                <div key={i}>
                {person.name} {person.number}
                </div>
            )}
        </>
    )
}

export default Persons