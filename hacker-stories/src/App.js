import React from 'react';
import logo from "./logo.svg";
import "./App.css";

const App = () => {
  const stories = [
    {
      title: "React",
      url: "https://reactjs.org/",
      author: "Jordan Walke",
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: "Redux",
      url: "https://redux.js.org/",
      author: "Dan Abramov, Andrew Clark",
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  const useSemiPersistentState = (key, initalState) => {
    //useState is used to update a variable value and re-render the page
    const [value, setValue] = React.useState(
      localStorage.getItem(key) || initalState
    );

    //useEffect will run every time the searchTerm updated
    React.useEffect(() => {
      localStorage.setItem(key, value)
      console.log("useEffect is running")
    }, [value, key])
    return [value, setValue]
  }


  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React')

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  }

  const string = () => "Search"

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <>
      <h1>My Hacker Stories</h1>
      <InputWithLabel id="search" value={searchTerm} isFocused={Boolean(true)} onInputChange={handleSearch}>
        {string()}
      </InputWithLabel>
      <hr />
      <List list={searchedStories} />
    </>
  )
}

const InputWithLabel = ({ id, value, isFocused, type = 'text',  onInputChange, children }) => {
  const inputRef = React.useRef();

  React.useEffect(()=>{
    if (isFocused&&inputRef.current){
      inputRef.current.focus()
    }
  },[isFocused])

  return (
    <div>
      <label htmlFor={id}>{children}</label>
      {/*using change handler from the parent*/}
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} autoFocus={isFocused} />
    </div>
  )
}


const List = ({ list }) => (
  list.map(({ objectID, ...item }) => <Item key={objectID} {...item} />)
);

const Item = ({ title, url, author, num_comments, points }) =>
(
  <div>
    <span>
      <a href={url}>{title}</a>
    </span>
    <span>{author}</span>
    <span>{num_comments}</span>
    <span>{points}</span>
  </div>
)

export default App;
