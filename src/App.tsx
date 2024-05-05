import './App.css'
import useApiRequest from "./utils/hooks/useApiRequest.ts";
import {UsersType} from "./utils/types/users.ts";

function App() {
   const { data, error, loading, refetch } = useApiRequest< UsersType >({
        url: 'https://reqres.in/api/users?page=1',
        method: 'GET'
    });
    console.log('data',data)
  return (
      <>
          <button onClick={() => refetch()}>Refetch Users</button>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
         {data && (
              <ul>
                  {data?.data?.map((user, index) => (
                      <li key={index}>{user?.email}</li>
                  ))}
              </ul>
          )}


      </>
  )
}

export default App
