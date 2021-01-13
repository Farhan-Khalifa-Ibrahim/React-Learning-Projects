import React from 'react';
import logo from "./logo.svg";
import "./App.css";
import axios from 'axios';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search/?query=';

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

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      }
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      }
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      }
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        )
      }
    default:
      throw new Error("There is problem in the reducer");
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'Redux');
  const [stories, dispatchStories] = React.useReducer(storiesReducer, { data: [], isLoading: false, isError: false });
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    try{
      const result = await axios.get(url);
      dispatchStories({
        type:'STORIES_FETCH_SUCCESS',
        payload:result.data.hits
      })
    }catch{
      dispatchStories({type:'STORIES_FETCH_FAILURE'})
    }
  }, [url])

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories])

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)
  }

  const handleRemoveStory = item => {
    dispatchStories({ type: 'REMOVE_STORY', payload: item });
  }

  return (
    <>
      <h1>My Hacker Stories</h1>
      <InputWithLabel id="search" value={searchTerm} isFocused={Boolean(true)} onInputChange={handleSearchInput}>
        Search:
      </InputWithLabel>
      <button type="button" disabled={!searchTerm} onClick={handleSearchSubmit}>Submit</button>
      <hr />
      {stories.isError && <p>Something went wrong...</p>}
      {stories.isLoading ? <p>Loading...</p> : <List list={stories.data} onRemoveItem={handleRemoveStory} />}
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
