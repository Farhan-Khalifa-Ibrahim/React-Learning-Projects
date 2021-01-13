import React from 'react';
import logo from "./logo.svg";
import "./App.css";

const intialStories = [
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

const getAsyncStories = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve({ data: { stories: intialStories } }), 2000)
  })

const useSemiPersistentState = (key, initalState) => {
  //useState is used to update a variable value and re-render the page
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initalState
  );

  //useEffect will run every time the searchTerm updated
  React.useEffect(() => {
    localStorage.setItem(key, value);
    console.log("useEffect is running");
  }, [value, key])
  return [value, setValue]
}

const storiesReducer = (state,action) => {
  if (action.type==='SET_STORIES'){
    return action.payload;
  }else if(action.type==='REMOVE_STORY'){
    return state.filter(
      story=>action.payload.objectID!==story.objectID
    )
  }else{
    throw new Error("Reducer not working right");
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [stories,dispatchStories] = React.useReducer(storiesReducer,[]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError,setIsError] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true)
    getAsyncStories().then(result => {
      dispatchStories({type:'SET_STORIES',payload:result.data.stories})
      setIsLoading(false);
    }).catch(()=>setIsError(true))
  }, [])

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  }

  const handleRemoveStory = item => {
    dispatchStories({type:'REMOVE_STORY',payload:item});
  }

  const string = () => "Search"
  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <h1>My Hacker Stories</h1>
      <InputWithLabel id="search" value={searchTerm} isFocused={Boolean(true)} onInputChange={handleSearch}>
        {string()}
      </InputWithLabel>
      <hr />
      {isError&&<p>Something went wrong...</p>}
      {isLoading ? <p>Loading...</p> : <List list={searchedStories} onRemoveItem={handleRemoveStory} />}
    </>
  )
}

const InputWithLabel = ({ id, value, isFocused, type = 'text', onInputChange, children }) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused])

  return (
    <div>
      <label htmlFor={id}>{children}</label>
      {/*using change handler from the parent*/}
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} autoFocus={isFocused} />
    </div>
  )
}


const List = ({ list, onRemoveItem }) => (
  list.map(item => <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />)
);

const Item = ({ item, onRemoveItem }) => {
  return (
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </div>
  )
}

export default App;
