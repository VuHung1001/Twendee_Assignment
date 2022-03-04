import { createSlice } from "@reduxjs/toolkit";

const usersRedux = createSlice({
  name: "users",
  initialState: {
    users: [],
    totalPage: 10,
    rowPerPage: 10,
    page: 1,
    sort: "name asc",
  },
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload.users;
      state.totalPage = action.payload.totalPage;
      state.rowPerPage = action.payload.rowPerPage;
      state.page = action.payload.page;
      state.sort = action.payload.sort;
    },
  },
});

export const { setUsers } = usersRedux.actions;
export default usersRedux.reducer;
