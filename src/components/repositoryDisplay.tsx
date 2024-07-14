import { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import "../components/repositoryDisplay.css";
import axios from "axios";
import _ from "lodash";
import { TailSpin } from "react-loader-spinner";

interface Repository {
  id: string;
  name: string;
  avatar: string;
  rating: string;
  description: string;
  language: string;
}
const options = [
  { value: "stars", label: "Stars ↑" },
  { value: "watchers", label: "Watchers Count ↑" },
  { value: "score", label: "Score ↑" },
  { value: "name", label: "Name ↑" },
  { value: "created_at", label: "Created ↑" },
  { value: "updated_at", label: "Updated ↑" },
];

const formatNumber = (num: number) => {
  if (num >= 1000 && num < 1000000) {
    return (num / 1000).toFixed(1) + "k";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else {
    return num.toString();
  }
};

const RepositoryDisplay = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [repositoryList, setRepositoryList] = useState<Repository[]>([]);
  const [sortField, setSortField] = useState({
    value: "created_at",
    label: "Created ↑",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(28);

  useEffect(() => {
    getRepositories(searchText, currentPage);
  }, [sortField, currentPage]);

  const getRepositories = async (search: string, page: number) => {
    setLoading(true);
    try {
      //Api to fetch list of repositories
      let results = await axios.get(
        `https://api.github.com/search/repositories?q=${
          search ? search : "react"
        }&sort=${sortField.value}
        &page=${page}&per_page=${pageLimit}`
      );
      const repoItems = results.data.items;
      const totalCount = results.data.total_count;
      // setting total pages here for Pagination component
      setTotalPages(Math.ceil(totalCount / pageLimit));
      const repos = repoItems.map((eachRepo: any): Repository => {
        const repoObject: Repository = {
          id: eachRepo.id,
          name: eachRepo.name,
          rating: formatNumber(eachRepo.stargazers_count),
          avatar: eachRepo.owner.avatar_url,
          description: eachRepo.description,
          language: eachRepo.language,
        };
        return repoObject;
      });
      // List of Repos to be displayed in the Page
      setRepositoryList(repos);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedGetRepositories = useCallback(
    // Debounce Callback for search Implementation
    _.debounce((search: string) => getRepositories(search, 1), 500),
    [sortField]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const search = event.target.value;
    setSearchText(search);
    setCurrentPage(1); // Reset the current page to 1
    debouncedGetRepositories(search);
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousClick = () => {
    // Pagination component previous click
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    // Pagination component next click
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function for generating page numbers in Pagination component
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 10;
    const middleIndex = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      // If total pages are less than or equal to 10, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Determine range of pages to show based on current page position
      let start = Math.max(1, currentPage - middleIndex);
      let end = Math.min(totalPages, start + maxPagesToShow - 1);

      if (end - start + 1 < maxPagesToShow) {
        start = Math.max(1, end - maxPagesToShow + 1);
      }

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="mainContainer">
      <div className="headerContainer">
        <input
          className="searchInput repo-font-size"
          placeholder="Search"
          value={searchText}
          onChange={handleSearchChange}
        />
        <div className="ws-text-color">Repository Browser</div>
        <div className="sortByContainer repo-font-size">
          <label className="repo-font-size sortByLabelColor">Sort by : </label>
          <Select
            isSearchable={false}
            className="sortbySelect repo-font-size"
            defaultValue={sortField}
            onChange={(event) => {
              if (event) {
                setSortField({
                  value: event.value,
                  label: event.label,
                });
              }
            }}
            options={options}
          />
        </div>
      </div>
      {loading ? (
        <div className="loaderContainer">
          <TailSpin height="80" width="80" color="white" ariaLabel="loading" />
        </div>
      ) : repositoryList.length === 0 ? (
        <div className="noDataContainer">
          <strong>
            Search returned zero repositories. Please refine your search terms.
          </strong>
        </div>
      ) : (
        <>
          <div className="repoListChildContainer">
            {repositoryList?.map((repo: Repository) => (
              <div key={repo.id} className="listMainDiv">
                <div className="detailsMainDiv">
                  <img src={repo.avatar} className="avatarImage" alt="Avatar" />
                  <div className="contentDiv">
                    <div className="repo-font-size details-padding-bottom">
                      <strong>Name: </strong>
                      {repo.name}
                    </div>
                    <div className="repo-font-size details-padding-bottom">
                      <strong>Description: </strong>
                      {repo.description}
                    </div>
                    <div className="repo-font-size details-padding-bottom">
                      <strong>Language: </strong>
                      {repo.language}
                    </div>
                    <div className="repo-font-size">
                      <strong>Stars: </strong>
                      {repo.rating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="paginationContainer">
            {totalPages > 1 && (
              <div className="pagination">
                {currentPage > 1 && (
                  <div className="pageBox" onClick={handlePreviousClick}>
                    &lt; Prev
                  </div>
                )}
                {generatePageNumbers().map((page) => (
                  <div
                    key={page}
                    className={`pageBox ${
                      currentPage === page ? "activePage" : ""
                    }`}
                    onClick={() => handlePageClick(page)}
                  >
                    {page}
                  </div>
                ))}
                {currentPage < totalPages && (
                  <div className="pageBox" onClick={handleNextClick}>
                    Next &gt;
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RepositoryDisplay;
