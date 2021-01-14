import React from 'react';
import styles from './App.module.css'
import axios from 'axios';
import { ReactComponent as Check } from './check.svg';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search/?query=';

const useSemiPersistentState = (key, initalState) => {
  //To prevent use effect getting localStorage when it is empty
  const isMounted = React.useRef(false);

  //useState is used to update a variable value and re-render the page
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initalState
  );

  //useEffect will run every time the searchTerm updated
  React.useEffect(() => {
    if (!isMounted) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
      console.log("useEffect is running");
    }
  }, [value, key])
  return [value, setValue]
}

// Reducer is used to update a value of a variable that is depend on more than 1 condition
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

const getSumComments = stories =>{
  console.log('C');
  return stories.data.reduce((result,value)=>result+value.num_comments,0);
}
const App = () => {
  console.log("B:App")

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', '');
  const [stories, dispatchStories] = React.useReducer(storiesReducer, { data: [], isLoading: false, isError: false });
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);
  const sumComments = React.useMemo(()=>getSumComments(stories),[stories]);

  //useCallback is used to prevent a function being called every time the page reRender
  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    try {
      const result = await axios.get(url);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits
      })
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
    }
  }, [url])

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories])

  const handleSearchInput = event => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  }

  //Use callback to let it run only if the component that use it being clicked
  const handleRemoveStory = React.useCallback(item => {
    dispatchStories({ type: 'REMOVE_STORY', payload: item });
  },[])

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories with {sumComments} comments.</h1>
      <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSubmit={handleSearchSubmit} />
      {stories.isError && <p>Something went wrong...</p>}
      {stories.isLoading ? <p>Loading...</p> : <List list={stories.data} onRemoveItem={handleRemoveStory} />}
    </div>
  )
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }) => (
  <form onSubmit={onSearchSubmit} className={styles.searchForm}>
    <InputWithLabel id="search" value={searchTerm} isFocused={Boolean(true)} onInputChange={onSearchInput}>
      Search:
      </InputWithLabel>
    <button type="submit" disabled={!searchTerm} className={`${styles.button} ${styles.buttonLarge}`}>Submit</button>
  </form>
)

const InputWithLabel = ({ id, value, isFocused, type = 'text', onInputChange, children }) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused])

  return (
    <div>
      <label htmlFor={id} className={styles.label}>{children}</label>
      {/*using change handler from the parent*/}
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} autoFocus={isFocused} className={styles.input} />
    </div>
  )
}

//Memo is used to prevent re running everytime render happen
const List = React.memo(({ list, onRemoveItem }) => (
  console.log("B:List") ||
  list.map(item => <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />)
));

const Item = ({ item, onRemoveItem }) => {
  return (
    <div className={styles.item}>
      <span style={{ width: '40%' }}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={{ width: '30%' }}>{item.author}</span>
      <span style={{ width: '10%' }}>{item.num_comments}</span>
      <span style={{ width: '10%' }}>{item.points}</span>
      <span style={{ width: '10%' }}>
        <button type="button" className={`${styles.button} ${styles.buttonSmall}`} onClick={() => onRemoveItem(item)}>
          <Check height="18px" width="18px" />
        </button>
      </span>
    </div>
  )
}

export default App;
