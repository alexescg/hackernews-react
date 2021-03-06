import React, {Component} from 'react';
import './App.css';

const DEFAULT_QUERY = "redux";
const DEFAULT_PAGE = 0;
const DEFAULT_HITS_PER_PAGE = 100;
const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
const PARAM_HITS_PER_PAGE = "hitsPerPage=";

// const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&`;

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            results: null,
            searchKey: '',
            searchTerm: DEFAULT_QUERY
        };
        this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
        this.setSearchTopStories = this.setSearchTopStories.bind(this);
        this.fetchSearchStories = this.fetchSearchStories.bind(this);
        this.onDismiss = this.onDismiss.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onSearchSubmit = this.onSearchSubmit.bind(this);
    }

    componentDidMount() {
        const {searchTerm} = this.state;
        this.setState({searchKey: searchTerm});
        this.fetchSearchStories(searchTerm, DEFAULT_PAGE);
    }

    setSearchTopStories(result) {
        const {hits, page} = result;
        const {searchKey, results} = this.state;


        const oldHits = results && results[searchKey]
            ? results[searchKey].hits
            : [];
        const updatedHits = [
            ...oldHits,
            ...hits
        ];
        this.setState({
            results: {
                ...results,
                [searchKey]: {hits: updatedHits, page}
            }
        });
        this.setState({result});
    }

    fetchSearchStories(searchTerm, page) {
        fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HITS_PER_PAGE}${DEFAULT_HITS_PER_PAGE}`)
            .then(response => response.json())
            .then(result => this.setSearchTopStories(result))
            .catch(e => e);
    }

    onDismiss(id) {
        const {searchKey, results} = this.state;
        const {hits, page} = results[searchKey];

        const isNotId = (item) => item.objectID !== id;

        const updatedHits = hits.filter(isNotId);
        this.setState({
            results: {...results, [searchKey]: {hits: updatedHits, page}}
        });
    }

    onSearchChange(event) {
        const searchTerm = event.target.value;
        this.setState({searchTerm})
    }

    onSearchSubmit(event) {
        const {searchTerm} = this.state;
        this.setState({searchKey: searchTerm});
        if (this.needsToSearchTopStories(searchTerm)) {
            this.fetchSearchStories(searchTerm, DEFAULT_PAGE);
        }
        event.preventDefault();
    }

    needsToSearchTopStories(searchTerm) {
        return !this.state.results[searchTerm];
    }

    render() {
        const {
            searchTerm,
            results,
            searchKey
        } = this.state;
        const page = (
            results
            && results[searchKey]
            && results[searchKey].page
        ) || 0;

        const list = (
            results
            && results[searchKey]
            && results[searchKey].hits
        ) || [];
        return (
            <div className="page">
                <div className="interactions">
                    <Search
                        value={searchTerm}
                        onChange={this.onSearchChange}
                        onSubmit={this.onSearchSubmit}
                    >
                        Search
                    </Search>
                </div>
                {results &&
                <Table
                    list={list}
                    onDismiss={this.onDismiss}/>
                }
                <div className="interactions">
                    <Button
                        onClick={() => this.fetchSearchStories(searchKey, page + 1)}>
                        More
                    </Button>
                </div>

            </div>
        );
    }
}

const Search = ({value, onChange, onSubmit, children}) =>
    <form onSubmit={onSubmit}>
        <input
            type="text"
            value={value}
            onChange={onChange}
        />
        <button type="submit">{children}</button>
    </form>;

const Table = ({list, onDismiss}) =>
    <div className="table">
        {list.map(item =>
            <div key={item.objectID} className="table-row">
                <span style={largeColumn}><a href={item.url}>{item.title}</a></span>
                <span style={midColumn}>{item.author}</span>
                <span style={smallColumn}>{item.num_comments}</span>
                <span style={smallColumn}>{item.points}</span>
                <span style={smallColumn}>
                    <Button className="button-inline"
                            onClick={() => onDismiss(item.objectID)}>
                        Dismiss
                    </Button>
                </span>
            </div>
        )}
    </div>;

const Button = ({onClick, className, children}) =>
    <button onClick={onClick}
            className={className}
            type="button">{children}</button>;

const isSearched = (searchTerm) => (item) =>
    !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());

const largeColumn = {
    width: '40%',
};
const midColumn = {
    width: '30%',
};
const smallColumn = {
    width: '10%',
};


export default App;
