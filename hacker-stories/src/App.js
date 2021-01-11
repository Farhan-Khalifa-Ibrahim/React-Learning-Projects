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

  const [searchTerm, setSearchTerm] = React.useState('React');

  const handleSearch = event => {
    setSearchTerm(event.target.value);
  }

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <h1>My Hacker Stories</h1>
      <Search onSearch={handleSearch} search={searchTerm}/>
      <hr />
      <List list={searchedStories}/>
    </div>
  )
}

const Search = (props) => {
  return (

    <div>
      <label htmlFor="search">Search: </label>
      {/*using change handler from the parent*/}
      <input id="search" type="text" value={props.search} onChange={props.onSearch} />
    </div>
  )
}


const List = (props) => {
  return (
    <div>
      {props.list.map((item) => {
        return (
          <div key={item.objectID}>
            <span>
              <a href={item.url}>{item.title}</a>
            </span>
            <span>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
          </div>
        );
      })}
    </div>
  );
};

export default App;