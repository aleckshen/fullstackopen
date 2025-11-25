const PersonForm = ({onSubmit, name, number, nameChange, numberChange}) => {
    return (
        <form onSubmit={onSubmit}>
            <div>
            name: <input value={name} onChange={nameChange}/>
            </div>
            <div>
            number: <input value={number} onChange={numberChange}/>
            </div>
            <div>
            <button type="submit">add</button>
            </div>
        </form>
    )
}

export default PersonForm