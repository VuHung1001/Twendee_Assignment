import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./redux/store";
import { setUsers } from "./redux/usersRedux";
import User from "./User";
import "./App.css";

const App = () => {
  const users: User[] | null = useSelector((state: RootState) => state.users);// get users from redux state
  //results get values from users above, we can sort values in results, not in users redux state
  const [results, setResults] = useState<User[]>([]);
  const dispatch = useDispatch();// dispatch used to send data for redux reducer
  const [isChanged, setIsChanged] = useState(false);// Shows whether the user has pressed the Re-Initialize button or not
  const [page, setPage] = useState(
    useSelector((state: RootState) => state.page) 
  ); // Page number for pagination
  const [rowPerPage, setRowPerPage] = useState(
    useSelector((state: RootState) => state.rowPerPage)
  );// Total rows(users) presented in table
  const [totalPage, setTotalPage] = useState(
    useSelector((state: RootState) => state.totalPage)
  );// Total pages( equal total users divide total rows)
  const [sort, setSort] = useState(
    useSelector((state: RootState) => state.sort)
  );// Sorting type (name, username sort by asc or desc)


  // This function used to re-initialize users array in redux state 
  // with new total users, new sorting type, new pagination
  const reInit = () => {
    const rowPageInput: number | undefined = Number(
      (document.getElementById("rowPerPage") as HTMLInputElement).value
    );
    const totalUserInput: number | undefined = Number(
      (document.getElementById("totalUsers") as HTMLInputElement).value
    );

    rowPageInput && setRowPerPage(rowPageInput);

    totalUserInput &&
      rowPageInput &&
      setTotalPage(totalUserInput / rowPageInput);

    totalUserInput / rowPageInput < page && setPage(1);

    setIsChanged(true);
  };


  // This function used as callback in array sort method for results array
  const sortWithCondition = useCallback(
    (a: User, b: User) => {
      if (sort === "name asc") {
        if (a.name.first < b.name.first) return -1;
        if (a.name.first > b.name.first) return 1;
      }
      if (sort === "name desc") {
        if (a.name.first < b.name.first) return 1;
        if (a.name.first > b.name.first) return -1;
      }
      if (sort === "username asc") {
        if (a.username < b.username) return -1;
        if (a.username > b.username) return 1;
      }
      if (sort === "username desc") {
        if (a.username < b.username) return 1;
        if (a.username > b.username) return -1;
      }
      return 0;
    },
    [sort]
  );


  // This function used to get users by call api
  const getUsers = useCallback(() => {
    return fetch(`https://randomuser.me/api/?results=${rowPerPage * totalPage}`)
      .then((res) => res.json())
      .then((res) => {
        return res.results as ReturnType<typeof res.results>;
      });
  }, [rowPerPage, totalPage]);

  useEffect(() => {
    // get users and will store them and total page, row per page, page, sorting type
    //  in local storage by call redux reducer
    (users.length === 0 || isChanged) &&
      getUsers().then((data) => {
        dispatch(
          setUsers({
            users: data.map((value: ReturnType<typeof data[0]>) => ({
              name: {
                title: value.name.title,
                first: value.name.first,
                last: value.name.last,
              },
              username: value.login.username,
              thumbnail: value.picture.thumbnail,
            })),
            totalPage,
            rowPerPage,
            page,
            sort,
          })
        );
        setIsChanged(false);
      });


    // set results by users and sort results every time when pagination, sorting type is changed
    // or when re-initialize users
    (users.length !== 0 || !isChanged) &&
      setResults([...users].sort(sortWithCondition));
  }, [
    page,
    rowPerPage,
    dispatch,
    totalPage,
    users,
    isChanged,
    sort,
    sortWithCondition,
    getUsers,
  ]);

  return (
    <>
      {/* pagination */}
      <ul className="pagination">
        <li onClick={() => setPage(1)}>&laquo;</li>
        {Array(totalPage)
          .fill(null)
          .map((value, index) => (
            <li
              key={index}
              className={index + 1 === page ? "active" : ""}
              onClick={(e) => {
                console.log(Number((e.target as HTMLLIElement).innerHTML));
                setPage(Number((e.target as HTMLLIElement).innerHTML));
              }}
            >
              {index + 1}
            </li>
          ))}
        <li onClick={() => setPage(totalPage)}>&raquo;</li>
      </ul>

      <div id="result">
        {/* select sorting type, insert total users, users number per page */}
        <div id="optional">
          <div>
            <label htmlFor="sort">Sort:</label>
            <select
              name="sort"
              id="sort"
              defaultValue={sort}
              onChange={(e) => {
                setSort(e.target.value);
              }}
            >
              <option value="name asc">Full Name (a-z)</option>
              <option value="name desc">Full Name (z-a)</option>
              <option value="username asc">Username (a-z)</option>
              <option value="username desc">Username (z-a)</option>
            </select>
          </div>

          <div>
            <label htmlFor="totalUsers">Total Users:</label>
            <input
              id="totalUsers"
              name="totalUsers"
              type="number"
              defaultValue={rowPerPage * totalPage}
            ></input>
          </div>

          <div>
            <label htmlFor="rowPerPage">Users per page:</label>
            <input
              id="rowPerPage"
              name="rowPerPage"
              type="number"
              defaultValue={rowPerPage}
            ></input>
          </div>

          <button onClick={reInit}>Re-Initialize</button>
        </div>

        {/* table present users information (full name, username, thumbnail) */}
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Thumbnail Icon</th>
            </tr>
          </thead>
          <tbody>
            {results
              .slice((page - 1) * rowPerPage, page * rowPerPage)
              .map((value, index) => (
                <tr key={index}>
                  <td>
                    {value.name.title +
                      " " +
                      value.name.first +
                      " " +
                      value.name.last}
                  </td>
                  <td>{value.username}</td>
                  <td>
                    <img src={value.thumbnail} alt="thumbnail" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default App;
